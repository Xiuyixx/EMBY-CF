import { getBestIPs, getResolveOverride } from './cf-ips.js';
import { chooseUpstreams } from './upstream.js';

const HOP_BY_HOP_HEADERS = [
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'host'
];

const RESPONSE_BLOCKED_HEADERS = ['cf-cache-status', 'cf-ray', 'server'];
const MAX_RETRIES = 3;
const REQUEST_TIMEOUT_MS = 10000;

function isWebSocketRequest(request) {
  return request.headers.get('Upgrade')?.toLowerCase() === 'websocket';
}

function copyHeaders(headers, blocked = []) {
  const output = new Headers();

  for (const [key, value] of headers.entries()) {
    if (blocked.includes(key.toLowerCase())) {
      continue;
    }

    output.set(key, value);
  }

  return output;
}

function buildForwardedHeaders(request, upstream, originalHost) {
  const headers = copyHeaders(request.headers, HOP_BY_HOP_HEADERS);
  const clientUrl = new URL(request.url);
  const upstreamUrl = new URL(upstream);

  headers.set('Host', originalHost || upstreamUrl.host);
  headers.set('X-Forwarded-Host', clientUrl.host);
  headers.set('X-Forwarded-Proto', clientUrl.protocol.replace(':', ''));
  headers.set('X-Forwarded-For', request.headers.get('CF-Connecting-IP') || '0.0.0.0');

  if (isWebSocketRequest(request)) {
    headers.set('Connection', 'Upgrade');
    headers.set('Upgrade', 'websocket');
  }

  return headers;
}

function createTargetUrl(request, upstream) {
  const clientUrl = new URL(request.url);
  const targetUrl = new URL(upstream);

  targetUrl.pathname = clientUrl.pathname;
  targetUrl.search = clientUrl.search;

  return targetUrl;
}

function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs);
    })
  ]);
}

function shouldRetry(response, error) {
  if (error) {
    return true;
  }

  return response.status >= 500;
}

function getPreferredIp(env) {
  if (String(env.USE_CF_IPS || '').toLowerCase() !== 'true') {
    return null;
  }

  const ips = getBestIPs(env.PREFERRED_REGION || 'apac');
  return ips[0] || null;
}

async function proxyToUpstream(request, upstream, env) {
  const originalUpstreamUrl = createTargetUrl(request, upstream);
  const preferredIp = getPreferredIp(env);
  const override = getResolveOverride(originalUpstreamUrl.toString(), preferredIp);
  const targetUrl = override.url;
  const headers = buildForwardedHeaders(request, upstream, override.originalHost);
  const init = {
    method: request.method,
    headers,
    redirect: 'manual'
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.clone().arrayBuffer();
  }

  return withTimeout(fetch(targetUrl, init), REQUEST_TIMEOUT_MS);
}

export async function handleProxyRequest(request, env) {
  const orderedUpstreams = await chooseUpstreams(env);
  const attempts = orderedUpstreams.slice(0, MAX_RETRIES);
  const errors = [];

  for (const upstream of attempts) {
    try {
      const response = await proxyToUpstream(request, upstream, env);

      if (shouldRetry(response)) {
        errors.push({ upstream, status: response.status });
        continue;
      }

      const headers = copyHeaders(response.headers, RESPONSE_BLOCKED_HEADERS);
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });
    } catch (error) {
      console.error(`Proxy attempt failed for ${upstream}:`, error);
      errors.push({ upstream, error: error.message });
    }
  }

  return new Response(
    JSON.stringify(
      {
        error: 'All upstreams failed',
        attempts: errors
      },
      null,
      2
    ),
    {
      status: 502,
      headers: {
        'content-type': 'application/json; charset=utf-8'
      }
    }
  );
}

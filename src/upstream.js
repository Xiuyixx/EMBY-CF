import { getUpstreams, getHealth, setHealth } from './config.js';

const DEFAULT_HEALTH_TIMEOUT_MS = 5000;

function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs);
    })
  ]);
}

function toHealthMap(records) {
  return new Map((Array.isArray(records) ? records : []).map((item) => [item.url, item]));
}

function getHealthCheckPath(env) {
  const configured = String(env.HEALTH_CHECK_PATH || '/').trim();
  if (!configured.startsWith('/')) {
    return `/${configured}`;
  }
  return configured || '/';
}

function getHealthTimeoutMs(env) {
  const value = Number(env.HEALTH_TIMEOUT_MS);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_HEALTH_TIMEOUT_MS;
}

function buildHealthUrl(upstreamUrl, env) {
  const url = new URL(upstreamUrl);
  url.pathname = getHealthCheckPath(env);
  url.search = '';
  return url.toString();
}

async function fetchHealth(url, timeoutMs) {
  const first = await withTimeout(fetch(new Request(url, { method: 'HEAD' })), timeoutMs);

  if (first.status === 405) {
    return withTimeout(fetch(new Request(url, { method: 'GET' })), timeoutMs);
  }

  return first;
}

export async function runHealthChecks(env) {
  const upstreams = await getUpstreams(env);
  const oldHealth = await getHealth(env);
  const oldHealthMap = toHealthMap(oldHealth);
  const timeoutMs = getHealthTimeoutMs(env);

  if (upstreams.length === 0) {
    console.warn('Health check skipped: no upstreams configured');
    await setHealth(env, []);
    return [];
  }

  const results = await Promise.all(
    upstreams.map(async (entry) => {
      const upstreamUrl = typeof entry === 'object' ? entry.url : entry;
      const startedAt = Date.now();

      try {
        const healthUrl = buildHealthUrl(upstreamUrl, env);
        const response = await fetchHealth(healthUrl, timeoutMs);
        const latency = Date.now() - startedAt;
        const healthy = response.ok;

        return {
          url: upstreamUrl,
          healthy,
          latency,
          lastCheck: new Date().toISOString(),
          status: response.status
        };
      } catch (error) {
        console.error(`Health check failed for ${upstreamUrl}:`, error);

        return {
          url: upstreamUrl,
          healthy: false,
          latency: -1,
          lastCheck: new Date().toISOString(),
          error: error.message,
          status: oldHealthMap.get(upstreamUrl)?.status || 0
        };
      }
    })
  );

  await setHealth(env, results);
  return results;
}

export async function chooseUpstreams(env) {
  const upstreams = await getUpstreams(env);
  const health = await getHealth(env);
  const healthMap = toHealthMap(health);

  if (upstreams.length === 0) {
    throw new Error('No upstreams configured');
  }

  const knownHealthCount = upstreams.filter((entry) => {
    const url = typeof entry === 'object' ? entry.url : entry;
    return healthMap.has(url);
  }).length;
  if (knownHealthCount === 0) {
    return upstreams.map((e) => typeof e === 'object' ? e.url : e);
  }

  const ranked = upstreams
    .map((entry, index) => {
      const url = typeof entry === 'object' ? entry.url : entry;
      const item = healthMap.get(url);
      return {
        url,
        index,
        healthy: item?.healthy ?? false,
        latency: Number.isFinite(item?.latency) && item.latency >= 0 ? item.latency : Number.POSITIVE_INFINITY
      };
    })
    .sort((a, b) => {
      if (a.healthy !== b.healthy) {
        return a.healthy ? -1 : 1;
      }

      if (a.latency !== b.latency) {
        return a.latency - b.latency;
      }

      return a.index - b.index;
    });

  return ranked.map((item) => item.url);
}

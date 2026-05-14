import { getUpstreams, getHealth, setHealth } from './config.js';

const HEALTH_TIMEOUT_MS = 5000;

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

export async function runHealthChecks(env) {
  const upstreams = await getUpstreams(env);
  const oldHealth = await getHealth(env);
  const oldHealthMap = toHealthMap(oldHealth);

  if (upstreams.length === 0) {
    console.warn('Health check skipped: no upstreams configured');
    await setHealth(env, []);
    return [];
  }

  const results = await Promise.all(
    upstreams.map(async (upstreamUrl) => {
      const startedAt = Date.now();

      try {
        const response = await withTimeout(
          fetch(new Request(upstreamUrl, { method: 'HEAD' })),
          HEALTH_TIMEOUT_MS
        );

        const latency = Date.now() - startedAt;
        const healthy = response.ok || (response.status >= 300 && response.status < 500);

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
          latency: Number.POSITIVE_INFINITY,
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

  const ranked = upstreams
    .map((url, index) => {
      const item = healthMap.get(url);
      return {
        url,
        index,
        healthy: item?.healthy ?? false,
        latency: Number.isFinite(item?.latency) ? item.latency : Number.POSITIVE_INFINITY,
        lastCheck: item?.lastCheck || null
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

  const hasHealthy = ranked.some((item) => item.healthy);
  if (!hasHealthy) {
    return [upstreams[0], ...upstreams.slice(1)];
  }

  return ranked.map((item) => item.url);
}

const UPSTREAMS_KEY = 'upstreams';
const HEALTH_KEY = 'upstream_health';

function parseJson(text, fallback) {
  if (!text) {
    return fallback;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error('Failed to parse KV JSON:', error);
    return fallback;
  }
}

function normalizeUpstreams(list) {
  return (Array.isArray(list) ? list : [])
    .map((item) => String(item || '').trim())
    .filter(Boolean);
}

export async function getUpstreams(env) {
  const kvText = await env.KV?.get(UPSTREAMS_KEY);
  const kvList = normalizeUpstreams(parseJson(kvText, []));

  if (kvList.length > 0) {
    return kvList;
  }

  return normalizeUpstreams(String(env.UPSTREAMS || '').split(','));
}

export async function getHealth(env) {
  const kvText = await env.KV?.get(HEALTH_KEY);
  const data = parseJson(kvText, []);
  return Array.isArray(data) ? data : [];
}

export async function setHealth(env, data) {
  if (!env.KV) {
    throw new Error('KV binding is required to save upstream health');
  }

  await env.KV.put(HEALTH_KEY, JSON.stringify(Array.isArray(data) ? data : []));
}

export async function setUpstreams(env, list) {
  if (!env.KV) {
    throw new Error('KV binding is required to save upstreams');
  }

  await env.KV.put(UPSTREAMS_KEY, JSON.stringify(normalizeUpstreams(list)));
}

import { getAdminHTML } from './admin-ui.js';
import { getHealth, getUpstreams, setUpstreams } from './config.js';
import { handleProxyRequest } from './proxy.js';
import { runHealthChecks } from './upstream.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8'
    }
  });
}

function isAuthorized(request, env) {
  const token = request.headers.get('X-Admin-Token');
  return Boolean(env.ADMIN_TOKEN) && token === env.ADMIN_TOKEN;
}

async function handleAdmin(request, env) {
  const url = new URL(request.url);

  if (request.method === 'GET' && (url.pathname === '/_admin' || url.pathname === '/_admin/')) {
    return new Response(getAdminHTML(), {
      headers: {
        'content-type': 'text/html; charset=utf-8'
      }
    });
  }

  if (!isAuthorized(request, env)) {
    return json({ error: 'Unauthorized' }, 401);
  }

  if (request.method === 'GET' && url.pathname === '/_admin/status') {
    const [upstreams, health] = await Promise.all([getUpstreams(env), getHealth(env)]);
    return json({ upstreams, health });
  }

  if (request.method === 'POST' && url.pathname === '/_admin/upstreams') {
    let payload;

    try {
      payload = await request.json();
    } catch {
      return json({ error: 'Invalid JSON body' }, 400);
    }

    if (!Array.isArray(payload?.upstreams) || payload.upstreams.length === 0) {
      return json({ error: 'Body must include a non-empty upstreams array' }, 400);
    }

    await setUpstreams(env, payload.upstreams);
    const upstreams = await getUpstreams(env);
    return json({ ok: true, upstreams });
  }

  return json({ error: 'Not found' }, 404);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/_admin' || url.pathname.startsWith('/_admin/')) {
      return handleAdmin(request, env, ctx);
    }

    try {
      return await handleProxyRequest(request, env, ctx);
    } catch (error) {
      console.error('Unhandled proxy error:', error);
      return json({ error: 'Internal Server Error', message: error.message }, 500);
    }
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(runHealthChecks(env));
  }
};

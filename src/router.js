const MEDIA_PATTERNS = [
  /^\/videos\/[^/]+\/stream/i,
  /^\/Items\/[^/]+\/Download/i,
  /^\/Audio\/[^/]+\/stream/i,
  /^\/Videos\/[^/]+\/original/i,
  /^\/LiveTv\/LiveStreamFiles\//i,
  /^\/Sync\/JobItems\/[^/]+\/File/i
];

const BACKEND_PATTERNS = [
  /^\/emby\/Videos\//i,
  /^\/emby\/Audio\//i,
  /^\/emby\/Items\//i,
  /^\/emby\/Users\//i,
  /^\/emby\/Sessions\//i,
  /^\/emby\/System\//i,
  /^\/emby\/Devices\//i,
  /^\/emby\/Playback\//i,
  /^\/emby\/LiveTv\//i,
  /^\/emby\/Sync\//i,
  /^\/emby\/socket/i,
  /^\/Videos\//i,
  /^\/Audio\//i,
  /^\/Items\//i,
  /^\/Users\//i,
  /^\/Sessions\//i,
  /^\/System\//i,
  /^\/Devices\//i,
  /^\/Playback\//i,
  /^\/LiveTv\//i,
  /^\/Sync\//i,
  /^\/socket/i,
  /^\/embywebsocket/i
];

const FRONTEND_PATTERNS = [
  /^\/$/,
  /^\/web(?:\/|$)/i,
  /^\/dashboard-ui(?:\/|$)/i,
  /^\/favicon\.ico$/i,
  /^\/manifest\.json$/i,
  /\.(?:html|js|mjs|css|map|png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|eot)$/i
];

export function isMediaRequest(request) {
  const pathname = new URL(request.url).pathname;
  return MEDIA_PATTERNS.some((pattern) => pattern.test(pathname));
}

function isBackendRequest(pathname) {
  return BACKEND_PATTERNS.some((pattern) => pattern.test(pathname));
}

function isFrontendRequest(pathname) {
  return FRONTEND_PATTERNS.some((pattern) => pattern.test(pathname));
}

export function classifyRequest(request) {
  const pathname = new URL(request.url).pathname;

  if (isMediaRequest(request)) {
    return { type: 'media', upstreamType: 'backend' };
  }

  if (isBackendRequest(pathname)) {
    return { type: 'api', upstreamType: 'backend' };
  }

  if (isFrontendRequest(pathname)) {
    return { type: 'api', upstreamType: 'frontend' };
  }

  return { type: 'api', upstreamType: 'backend' };
}

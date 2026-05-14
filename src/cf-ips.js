// 常用 Cloudflare 优选 IP 示例列表。
// 用途：当上游域名挂在 Cloudflare 或用户自行维护了可直连的优选节点时，
// 可以将请求临时改写为这些 IP，并保留原始 Host header，以便做链路优选。
// 说明：IP 会随网络环境变化，请按实际压测结果维护。

const CF_IPS = {
  apac: [
    '1.0.0.1',
    '1.1.1.1',
    '8.219.98.10',
    '8.222.134.12',
    '8.210.21.16',
    '47.74.32.11',
    '47.245.57.21',
    '47.91.95.174',
    '129.150.36.179',
    '152.32.175.231'
  ],
  europe: [
    '104.16.0.1',
    '104.17.0.1',
    '141.101.120.10',
    '141.101.121.10',
    '162.159.128.10',
    '162.159.129.10',
    '188.114.96.10',
    '188.114.97.10',
    '198.41.192.10',
    '198.41.193.10'
  ],
  us: [
    '104.18.0.1',
    '104.19.0.1',
    '172.64.0.10',
    '172.64.1.10',
    '162.159.36.10',
    '162.159.46.10',
    '198.41.200.10',
    '198.41.201.10',
    '190.93.244.10',
    '190.93.245.10'
  ]
};

export function getBestIPs(region = 'apac') {
  const key = String(region || 'apac').toLowerCase();
  return CF_IPS[key] || CF_IPS.apac;
}

export function getResolveOverride(upstreamUrl, preferredIp) {
  const url = new URL(upstreamUrl);
  const originalHost = url.host;

  if (!preferredIp) {
    return {
      url: url.toString(),
      originalHost,
      overridden: false
    };
  }

  url.hostname = preferredIp;

  return {
    url: url.toString(),
    originalHost,
    overridden: true
  };
}

export { CF_IPS };

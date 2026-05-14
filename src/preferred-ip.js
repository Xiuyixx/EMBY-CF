// preferred-ip.js — 优选 IP / 优选代理支持
// 用途：将上游请求改写为指定 IP 或代理地址，绕过 DNS 解析，降低延迟。
//
// 两种用法：
//   1. 优选 IP：直接填一个 IP（如 104.16.0.1），Worker 向该 IP 发请求，Host 保持原域名
//   2. 优选代理：填一个代理域名/IP（如 proxy.example.com 或 1.2.3.4:8080），效果相同
//
// 通过环境变量 PREFERRED_IP 配置，格式：
//   单个：104.16.0.1
//   带端口：104.16.0.1:443
//   代理域名：proxy.example.com
//   多个随机选一个：104.16.0.1,104.17.0.1,proxy.example.com

/**
 * 解析 PREFERRED_IP 环境变量，返回候选列表
 * @param {object} env
 * @returns {string[]}
 */
export function getPreferredIPs(env) {
  const raw = String(env.PREFERRED_IP || '').trim();
  if (!raw) return [];
  return raw
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

/**
 * 从候选列表中随机取一个优选 IP/代理
 * 若设置了 CF_IP_INDEX 环境变量则固定取对应下标（方便调试）
 * @param {object} env
 * @returns {string|null}
 */
export function pickPreferredIP(env) {
  const ips = getPreferredIPs(env);
  if (ips.length === 0) return null;

  const fixedIndex = Number(env.CF_IP_INDEX);
  if (Number.isInteger(fixedIndex) && fixedIndex >= 0) {
    return ips[fixedIndex % ips.length];
  }

  return ips[Math.floor(Math.random() * ips.length)];
}

/**
 * 将上游 URL 的 hostname（和端口）替换为优选 IP/代理
 * 返回改写后的 URL 字符串和原始 Host
 *
 * 例：
 *   upstream = "https://emby.example.com/videos/1/stream"
 *   preferredIp = "104.16.0.1"
 *   → url = "https://104.16.0.1/videos/1/stream"
 *   → originalHost = "emby.example.com"
 *
 * @param {string} upstreamUrl
 * @param {string} preferredIp  IP 或 host:port
 * @returns {{ url: string, originalHost: string }}
 */
export function applyPreferredIP(upstreamUrl, preferredIp) {
  const url = new URL(upstreamUrl);
  const originalHost = url.host; // 含端口（如有）

  // 解析优选地址，可能带端口（如 1.2.3.4:8080 或 proxy.example.com:8443）
  const colonIdx = preferredIp.lastIndexOf(':');
  const hasPort = colonIdx > 0 && !preferredIp.includes('['); // 排除 IPv6

  if (hasPort) {
    url.hostname = preferredIp.slice(0, colonIdx);
    url.port = preferredIp.slice(colonIdx + 1);
  } else {
    url.hostname = preferredIp;
    url.port = ''; // 清空端口，使用协议默认端口
  }

  return { url: url.toString(), originalHost };
}

/**
 * 判断是否启用了优选 IP
 * @param {object} env
 * @returns {boolean}
 */
export function isPreferredIPEnabled(env) {
  return getPreferredIPs(env).length > 0;
}

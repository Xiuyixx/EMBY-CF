// preferred-ip.js — 优选 IP / 优选代理支持
// 优先级：KV/内存（面板配置）> 环境变量 PREFERRED_IP > 不启用

import { getPreferredIPs as getStoredPreferredIPs } from './config.js';

/**
 * 获取当前生效的优选 IP 列表
 * 优先读 KV/内存（面板配置），回落到环境变量
 * @param {object} env
 * @returns {Promise<string[]>}
 */
export async function getPreferredIPs(env) {
  return getStoredPreferredIPs(env);
}

/**
 * 随机选一个优选 IP/代理
 * @param {object} env
 * @returns {Promise<string|null>}
 */
export async function pickPreferredIP(env) {
  const ips = await getPreferredIPs(env);
  if (ips.length === 0) return null;

  const fixedIndex = Number(env.CF_IP_INDEX);
  if (Number.isInteger(fixedIndex) && fixedIndex >= 0) {
    return ips[fixedIndex % ips.length];
  }

  return ips[Math.floor(Math.random() * ips.length)];
}

/**
 * 判断是否启用了优选 IP（同步版，用于初始判断）
 * 注意：实际使用请调用 pickPreferredIP，此函数只读环境变量
 * @param {object} env
 * @returns {boolean}
 */
export function isPreferredIPEnabledSync(env) {
  return Boolean(String(env.PREFERRED_IP || '').trim());
}

/**
 * 将上游 URL 的 hostname 替换为优选 IP/代理
 * Host header 保持原域名
 * @param {string} upstreamUrl
 * @param {string} preferredIp  IP 或 host:port
 * @returns {{ url: string, originalHost: string }}
 */
export function applyPreferredIP(upstreamUrl, preferredIp) {
  const url = new URL(upstreamUrl);
  const originalHost = url.host;

  // 处理带端口的情况（排除 IPv6 地址）
  const isIPv6 = preferredIp.startsWith('[');
  const colonIdx = isIPv6 ? -1 : preferredIp.lastIndexOf(':');
  const hasPort = colonIdx > 0;

  if (hasPort) {
    url.hostname = preferredIp.slice(0, colonIdx);
    url.port = preferredIp.slice(colonIdx + 1);
  } else {
    url.hostname = preferredIp;
    url.port = '';
  }

  return { url: url.toString(), originalHost };
}

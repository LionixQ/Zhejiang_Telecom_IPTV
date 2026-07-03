/**
 * Cloudflare Pages Function — Subscribe API
 *
 * Route: GET /api/subscribe/:source/:type
 *
 * Path params:
 *   source — "multicast" | "unicast"
 *   type   — "m3u" | "txt"
 *
 * Query params:
 *   udpxy   — (required for multicast) UDPXY address (IP:PORT or DOMAIN:PORT)
 *   logo    — (optional, m3u only) custom logo server address
 *   ip      — (optional, unicast only) replace IP in RTSP URLs (strict IPv4)
 *   nocache — (optional flag) bypass cache
 */

export async function onRequestGet(context) {
  const { source, type } = context.params;
  const url = new URL(context.request.url);
  const udpxy = url.searchParams.get('udpxy') || '';
  const logoParam = url.searchParams.get('logo') || '';
  const ip = url.searchParams.get('ip') || '';
  const noCache = url.searchParams.has('nocache');

  // ── Validate source ──────────────────────────────────
  if (source !== 'multicast' && source !== 'unicast') {
    return jsonError(400, '路径无效，仅支持 /api/subscribe/multicast 或 /api/subscribe/unicast');
  }

  // ── Validate type ────────────────────────────────────
  if (type !== 'm3u' && type !== 'txt') {
    return jsonError(400, '路径无效，仅支持 /api/subscribe/{source}/m3u 或 /api/subscribe/{source}/txt');
  }

  // ── Validate udpxy ───────────────────────────────────
  if (source === 'multicast' && !udpxy) {
    return jsonError(400, 'udpxy 参数为必填（组播源需要 UDPXY 地址）');
  }
  if (source === 'unicast' && udpxy) {
    return jsonError(400, 'udpxy 参数仅在 source=multicast 时有效');
  }
  if (udpxy && !isValidAddress(udpxy)) {
    return jsonError(400, 'udpxy 参数格式无效，应为 IP:端口 或 域名:端口');
  }

  // ── Validate logo ────────────────────────────────────
  if (logoParam && type === 'txt') {
    return jsonError(400, 'logo 参数仅在 type=m3u 时有效');
  }
  if (logoParam && !isValidHost(logoParam)) {
    return jsonError(400, 'logo 参数格式无效，应为 IP、域名，可带端口');
  }

  // ── Validate ip (unicast RTSP IP replacement) ────────
  if (ip && source === 'multicast') {
    return jsonError(400, 'ip 参数仅在 source=unicast 时有效');
  }
  if (ip && !isValidIP(ip)) {
    return jsonError(400, 'ip 参数格式无效，应为合法 IPv4 地址（不含端口）');
  }

  // ── Determine source file path ───────────────────────
  let filePath;
  if (source === 'multicast') {
    filePath = type === 'm3u'
      ? '/Zhejiang_Multicast/Zhejiang_Multicast_OL.m3u'          // local-logo template (has placeholders)
      : '/Zhejiang_Multicast/Zhejiang_Multicast.txt';
  } else {
    filePath = type === 'm3u'
      ? '/Zhejiang_Unicast/Zhejiang_Unicast_OL.m3u'
      : '/Zhejiang_Unicast/Zhejiang_Unicast.txt';
  }

  // ── Fetch static file from same origin ───────────────
  let content;
  try {
    const fileUrl = new URL(filePath, url.origin);
    const res = await fetch(fileUrl);
    if (!res.ok) {
      return jsonError(500, `读取模板文件失败: HTTP ${res.status}`);
    }
    content = await res.text();
  } catch (err) {
    return jsonError(500, `读取模板文件失败: ${err.message}`);
  }

  // ── Replace template placeholders ────────────────────
  const udpxyResolved = udpxy
    ? udpxy.replace(/^https?:\/\//, '').replace(/\/udp\/?$/, '')
    : '';
  const logoBase = logoParam
    ? logoParam                            // user's server:port, e.g. "192.168.1.1:8080"
    : url.origin.replace(/^https?:\/\//, '');  // "myepg.org" (strip protocol)

  content = content.replace(/\{\{your_udpxy_address\}\}/g, udpxyResolved);
  content = content.replace(/\{\{your_logo_address\}\}/g, logoBase);

  // ── Replace hardcoded online logo URLs (OL files have https://myepg.org/Logo/) ──
  if (logoParam) {
    content = content.replace(/https:\/\/myepg\.org\/Logo\//g, `http://${logoParam}/Logo/`);
  }

  // ── Replace RTSP IP for unicast ──────────────────────
  if (source === 'unicast' && ip) {
    content = content.replace(
      /rtsp:\/\/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?(\/)/g,
      `rtsp://${ip}$2$3`
    );
  }

  // ── Response ─────────────────────────────────────────
  const contentType = type === 'm3u'
    ? 'audio/x-mpegurl; charset=utf-8'
    : 'text/plain; charset=utf-8';
  const cacheControl = noCache ? 'no-cache' : 'public, max-age=300';

  return new Response(content, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${source}.${type}"`,
      'Cache-Control': cacheControl,
      'Access-Control-Allow-Origin': '*',
    },
  });
}

// ── Helpers ──────────────────────────────────────────────

function jsonError(code, message) {
  return new Response(JSON.stringify({ code, message }), {
    status: code >= 500 ? 500 : 400,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

/** Validate "IP:PORT" or "DOMAIN:PORT" format */
function isValidAddress(s) {
  const idx = s.lastIndexOf(':');
  if (idx <= 0) return false;
  const host = s.substring(0, idx);
  const port = s.substring(idx + 1);

  // Port must be numeric 1-65535
  const portNum = parseInt(port, 10);
  if (isNaN(portNum) || portNum < 1 || portNum > 65535) return false;

  // Check IPv4 (each octet 0-255, no leading zeros)
  const ipv4Re = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Re.test(host)) {
    const parts = host.split('.');
    for (const p of parts) {
      if (p.length > 1 && p[0] === '0') return false;  // no leading zeros
      const n = parseInt(p, 10);
      if (!/^\d+$/.test(p) || isNaN(n) || n < 0 || n > 255) return false;  // range check
    }
    return true;
  }

  // Check domain
  const domainRe = /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  return domainRe.test(host);
}

/** Strict IPv4 validation — no leading zeros, no ports */
/** Validate host (IP or domain), optionally with port */
function isValidHost(s) {
  if (s.includes(':')) {
    return isValidAddress(s);
  }
  // Check IPv4 (each octet 0-255, no leading zeros)
  const ipv4Re = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Re.test(s)) {
    const parts = s.split('.');
    for (const p of parts) {
      if (p.length > 1 && p[0] === '0') return false;
      const n = parseInt(p, 10);
      if (isNaN(n) || n < 0 || n > 255) return false;
    }
    return true;
  }
  // Check domain
  const domainRe = /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  return domainRe.test(s);
}

function isValidIP(s) {
  const parts = s.split('.');
  if (parts.length !== 4) return false;
  for (const p of parts) {
    // disallow leading zeros (except "0" itself)
    if (p.length > 1 && p[0] === '0') return false;
    const n = parseInt(p, 10);
    if (!/^\d+$/.test(p) || isNaN(n) || n < 0 || n > 255) return false;
  }
  return true;
}

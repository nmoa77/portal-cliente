'use strict';
// Web Push nativo para Node.js 18+ (RFC 8291 / RFC 8188): sem dependências npm.
// As chaves VAPID são fornecidas em variáveis de ambiente, nunca no GitHub.
const crypto = require('crypto');

function decode(value) {
  return Buffer.from(String(value || ''), 'base64url');
}
function encode(value) {
  return Buffer.from(value).toString('base64url');
}
function concat(...data) { return Buffer.concat(data.map(v => Buffer.from(v))); }
function vapidConfig() {
  const pub = decode(process.env.DUIT_VAPID_PUBLIC_KEY);
  const priv = decode(process.env.DUIT_VAPID_PRIVATE_KEY);
  if (pub.length !== 65 || pub[0] !== 4 || priv.length !== 32) return null;
  return { pub, priv, subject: process.env.DUIT_VAPID_SUBJECT || 'mailto:info@duit.pt' };
}
function vapidJWT(endpoint, config) {
  const aud = new URL(endpoint).origin;
  const head = encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' }));
  const body = encode(JSON.stringify({ aud, exp: Math.floor(Date.now() / 1000) + 3600, sub: config.subject }));
  const content = head + '.' + body;
  const key = crypto.createPrivateKey({
    key: { kty: 'EC', crv: 'P-256',
      x: encode(config.pub.subarray(1, 33)),
      y: encode(config.pub.subarray(33, 65)),
      d: encode(config.priv) }, format: 'jwk'
  });
  return content + '.' + encode(crypto.sign('sha256', Buffer.from(content), { key, dsaEncoding:'ieee-p1363' }));
}
function encryptForSubscription(subscription, message) {
  const clientPublic = decode(subscription.keys.p256dh);
  const authSecret = decode(subscription.keys.auth);
  if (clientPublic.length !== 65 || clientPublic[0] !== 4 || authSecret.length !== 16) {
    throw new Error('Chaves de Push inválidas');
  }
  const server = crypto.createECDH('prime256v1');
  server.generateKeys();
  const serverPublic = server.getPublicKey(undefined, 'uncompressed');
  const shared = server.computeSecret(clientPublic);
  const ikmKey = crypto.hkdfSync('sha256', shared, authSecret,
    concat('WebPush: info\0', clientPublic, serverPublic), 32);
  const salt = crypto.randomBytes(16);
  const cek = crypto.hkdfSync('sha256', ikmKey, salt,
    Buffer.from('Content-Encoding: aes128gcm\0'), 16);
  const nonce = crypto.hkdfSync('sha256', ikmKey, salt,
    Buffer.from('Content-Encoding: nonce\0'), 12);
  const cipher = crypto.createCipheriv('aes-128-gcm', cek, nonce);
  const plaintext = concat(Buffer.from(JSON.stringify(message)), Buffer.from([2]));
  const encrypted = concat(cipher.update(plaintext), cipher.final(), cipher.getAuthTag());
  const recordSize = Buffer.alloc(4); recordSize.writeUInt32BE(4096,0);
  return concat(salt, recordSize, Buffer.from([65]), serverPublic, encrypted);
}
async function sendPush(subscription, message) {
  const config = vapidConfig();
  if (!config) throw new Error('Chaves VAPID não configuradas');
  const endpoint = new URL(subscription.endpoint);
  if (endpoint.protocol !== 'https:' || !endpoint.hostname) throw new Error('Endpoint Push inválido');
  const body = encryptForSubscription(subscription, message);
  const response = await fetch(endpoint.href, {
    method:'POST', signal: AbortSignal.timeout(12000),
    headers: {
      'Authorization': 'vapid t=' + vapidJWT(endpoint.href, config) + ', k=' + encode(config.pub),
      'TTL':'3600', 'Urgency':'normal', 'Content-Encoding':'aes128gcm',
      'Content-Type':'application/octet-stream'
    }, body
  });
  if (!response.ok) {
    const error = new Error('Push HTTP ' + response.status);
    error.status = response.status;
    throw error;
  }
  return true;
}
module.exports = { sendPush, vapidConfig, encryptForSubscription };

'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { encryptForSubscription, vapidConfig } = require('../backend/duit-web-push');

test('Web Push AES128GCM round trip for Android browser', () => {
  const receiver=crypto.createECDH('prime256v1');receiver.generateKeys();
  const clientPublic=receiver.getPublicKey(undefined,'uncompressed');
  const auth=crypto.randomBytes(16);
  const notification={title:'DUIT · Story pronta',body:'Seven Fitness',url:'/social-stories.html?story=7'};
  const encrypted=encryptForSubscription({
    keys:{p256dh:clientPublic.toString('base64url'),auth:auth.toString('base64url')}
  },notification);
  assert.equal(encrypted.subarray(16,20).readUInt32BE(),4096);
  assert.equal(encrypted[20],65);
  const salt=encrypted.subarray(0,16);
  const serverPublic=encrypted.subarray(21,86);
  const shared=receiver.computeSecret(serverPublic);
  const ikm=crypto.hkdfSync('sha256',shared,auth,
    Buffer.concat([Buffer.from('WebPush: info\0'),clientPublic,serverPublic]),32);
  const cek=crypto.hkdfSync('sha256',ikm,salt,Buffer.from('Content-Encoding: aes128gcm\0'),16);
  const nonce=crypto.hkdfSync('sha256',ikm,salt,Buffer.from('Content-Encoding: nonce\0'),12);
  const payload=encrypted.subarray(86);
  const decipher=crypto.createDecipheriv('aes-128-gcm',cek,nonce);
  decipher.setAuthTag(payload.subarray(-16));
  const plain=Buffer.concat([decipher.update(payload.subarray(0,-16)),decipher.final()]);
  assert.equal(plain[plain.length-1],2);
  assert.deepEqual(JSON.parse(plain.subarray(0,-1).toString()),notification);
});

test('Web Push rejects invalid browser keys', () => {
  assert.throws(()=>encryptForSubscription({keys:{p256dh:'bad',auth:'bad'}},{body:'x'}));
});

test('VAPID is disabled when credentials are not configured', () => {
  const oldPublic=process.env.DUIT_VAPID_PUBLIC_KEY, oldPrivate=process.env.DUIT_VAPID_PRIVATE_KEY;
  delete process.env.DUIT_VAPID_PUBLIC_KEY;
  delete process.env.DUIT_VAPID_PRIVATE_KEY;
  try {assert.equal(vapidConfig(),null);}
  finally {
    if(oldPublic!==undefined)process.env.DUIT_VAPID_PUBLIC_KEY=oldPublic;
    if(oldPrivate!==undefined)process.env.DUIT_VAPID_PRIVATE_KEY=oldPrivate;
  }
});

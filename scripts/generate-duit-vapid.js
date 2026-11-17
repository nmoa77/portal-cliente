// Executar localmente: node scripts/generate-duit-vapid.js
// Copiar valores para Railway Variables, nunca guardar no repositório.
const crypto = require('crypto');
const pair = crypto.createECDH('prime256v1');
pair.generateKeys();
const pub = pair.getPublicKey(undefined, 'uncompressed');
const priv = pair.getPrivateKey();
console.log('DUIT_VAPID_PUBLIC_KEY=' + pub.toString('base64url'));
console.log('DUIT_VAPID_PRIVATE_KEY=' + priv.toString('base64url'));
console.log('DUIT_VAPID_SUBJECT=mailto:info@duit.pt');
console.log('DUIT_SOCIAL_REMINDERS_ENABLED=true');
console.log('\nNão execute este gerador novamente depois de ativar as notificações,');
console.log('senão os telemóveis terão de voltar a subscrever-se.');

const fs = require('fs');
const path = require('path');

// Garante que o CRM novo inclui MESMO o fluxo antigo completo de propostas:
// serviços existentes, valores personalizados, envio por email com link público,
// tracking de abertura, aprovação/rejeição e conversão em cliente.
try {
  const crmJs = path.join(__dirname, '..', 'public', 'js', 'prospects-crm.js');
  const bridgeJs = path.join(__dirname, '..', 'public', 'js', 'prospects-legacy-bridge.js');
  const crmServer = path.join(__dirname, 'crm-server.js');

  let crmSource = fs.readFileSync(crmJs, 'utf8');
  const bridgeSource = fs.readFileSync(bridgeJs, 'utf8');

  // Em vez de depender de um segundo <script> carregado depois, junta a ponte
  // diretamente ao ficheiro CRM servido ao browser. Evita problemas de timing/cache.
  if (!crmSource.includes('DUIT — Bridge CRM + fluxo antigo de propostas')) {
    crmSource += `\n\n${bridgeSource}\n`;
    fs.writeFileSync(crmJs, crmSource, 'utf8');
  }

  // Força nova versão do JS no HTML para o browser não reutilizar a versão antiga.
  let serverSource = fs.readFileSync(crmServer, 'utf8');
  serverSource = serverSource.replace(
    /prospects-crm\.js\?v=[^\"']+/g,
    'prospects-crm.js?v=20260825c'
  );
  fs.writeFileSync(crmServer, serverSource, 'utf8');
} catch (e) {
  console.warn('[crm] não foi possível ligar fluxo completo de propostas:', e.message);
}

require('./crm-server');
require('./prospect-seed');

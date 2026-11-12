# DUIT Social — configuração (ramificação de desenvolvimento)

## Situação

Esta ramificação acrescenta preparação e partilha de Stories, agenda e alertas Android,
e a ligação de contas profissionais à Meta. A publicação automática de Posts,
Carrosséis e Reels **ainda não está implementada**. Não executar em produção
sem validar os percursos em dispositivo Android e no ambiente de testes Railway.

## Configuração técnica

- Node.js 22 recomendado; servir sempre o portal em HTTPS.
- Definir `DATABASE_PATH` num volume persistente Railway.
- Opcional `DUIT_SOCIAL_MEDIA_DIR` para os ficheiros das Stories, **no mesmo
  volume persistente** ou noutro volume durável. Não usar pastas temporárias.
- O upload aceita JPEG, PNG, WEBP e MP4 até 80 MB.
- O estado 'published' é manual: confirmação na interface elimina ficheiros
  após publicação no Instagram. Não existe verificação automática da publicação
  manual no Instagram.

### Notificações Android

1. Executar localmente `node scripts/generate-duit-vapid.js`.
2. Adicionar ao Railway:
   - `DUIT_VAPID_PUBLIC_KEY`
   - `DUIT_VAPID_PRIVATE_KEY`
   - `DUIT_VAPID_SUBJECT=mailto:info@duit.pt`
   - `DUIT_SOCIAL_REMINDERS_ENABLED=true` **apenas num processo**
3. No Chrome Android, abrir `/social-stories.html`, instalar a PWA e tocar
   em «Ativar notificações» e «Enviar teste».
4. Testar agendamento real com o telemóvel bloqueado e o navegador fechado.
   Receção de Push depende de rede, permissões e sistema operativo.

### Conta Meta por cliente

Registar uma aplicação na Meta for Developers, adicionar Facebook Login e configurar
o URI de redirecionamento OAuth exatamente como
`https://SEU-DOMINIO/api/duit-social/meta/callback`.

Configurar no Railway:
- `DUIT_META_APP_ID`
- `DUIT_META_APP_SECRET`
- `DUIT_META_ENCRYPTION_KEY`: 32 bytes aleatórios, codificados em base64url
  (ex.: executar localmente `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`)
- `DUIT_META_REDIRECT_URI`: endereço HTTPS exato do callback
- `DUIT_META_GRAPH_VERSION`: versão suportada pelo Meta Graph, por exemplo `v25.0`, verificar antes da ativação.

A app pede autorização para `pages_show_list`, `pages_read_engagement`,
`pages_manage_posts`, `instagram_basic`, `instagram_content_publish`.
Podem ser necessárias verificação comercial, acesso avançado/App Review e
permissões de contas profissionais ligadas às Páginas.

**Nunca colocar tokens, APP_SECRET ou chaves de encriptação no GitHub**.
A alteração de `DUIT_META_ENCRYPTION_KEY` invalida os tokens guardados;
planear rotação e revogação. Desligar uma conta no portal elimina apenas o
token local, não revoga todas as autorizações na Meta.

## Percurso de teste

1. Criar uma Story para cliente e data/hora, carregar JPG/MP4.
2. Confirmar que aparece no calendário diário/mensal.
3. Ativar notificações no Android e enviar notificação de teste.
4. Agendar Story para uma hora próxima; verificar aviso com nome do cliente.
5. Abrir aviso, preparar ficheiro e partilhar para a Story no Instagram.
6. Adicionar música manualmente, publicar; voltar ao portal e tocar em
   «Já publiquei».
7. Confirmar que ficheiro original foi apagado e histórico mantido.
8. Validar que outro utilizador sem perfil admin não acede aos ficheiros.
9. Testar sem permissão Push, sem Internet, envio repetido e erros de upload.
10. Só depois avançar para publicação automática de Posts/Reels.

## Execução de testes

`node --test tests/duit-web-push.test.js`

A CI da pull request executa os testes de criptografia Push e verificação
de sintaxe; **não substitui testes end-to-end com o Android, Meta e Railway**.

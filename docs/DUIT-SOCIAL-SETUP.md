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

## Contas Meta por cliente (escalável)

Começamos com **Seven Fitness Club** e **DUIT**, mas o portal permite ligar mais clientes futuramente sem alterações de código. A conta Meta Business pode mostrar muitas Páginas; após OAuth, o administrador escolhe explicitamente **uma Página por cliente**. As restantes Páginas não são associadas ao portal.

## Motor de publicações (fase inicial)

- `DUIT_SOCIAL_PUBLISH_ENABLED=false` por defeito. Nunca ativar antes de validar
  os testes e os dois clientes escolhidos.
- `DUIT_SOCIAL_PUBLIC_URL=https://DOMINIO-PORTAL` define a origem pública HTTPS
  pela qual a API Meta obtém as imagens e vídeos, usando links assinados
  temporários.
- `DUIT_SOCIAL_MEDIA_SIGNING_KEY`: segredo de 32+ caracteres aleatórios.
- Um único processo do Railway deve ter a publicação agendada ativa.
- Posts simples: imagem JPEG Instagram/Facebook.
- Carrosséis: 2–10 imagens JPEG, Instagram/Facebook.
- Reels: MP4 Instagram e Facebook, com publicadores independentes e confirmação da Meta por rede.
- A API Meta deve confirmar cada canal antes da eliminação dos ficheiros.
- Em timeout, o estado fica `review`, sem repetir automaticamente. Confirmar
  manualmente se a plataforma chegou a publicar para evitar duplicados.
- As publicações reais exigem a autorização de cada Página e conta profissional
  Instagram, bem como permissões Meta aplicáveis.
- Limites de formatos/duração do vídeo exigem validação de media antes de
  produção.

### Segurança

As rotas de administração exigem o utilizador admin e validam Origin.
Os ficheiros da publicação só são expostos temporariamente à Meta por URLs
assinadas quando o motor de publicação está ativado. Não são servidos como
ficheiros estáticos públicos.

### Aviso

Não se deve marcar a PR como concluída sem testar publicação e confirmação
reais no ambiente autorizado. Esta versão inclui a estrutura do publicador,
não a integração completa Facebook Reels.

## Clientes atuais e futuros

Na configuração inicial serão associados Seven Fitness Club e DUIT. Para um novo cliente, criar o respetivo registo principal no portal e escolher a Página Meta autorizada. Não existe um limite fixo de dois clientes; os limites efetivos de API e infraestrutura terão de ser respeitados.

## Reels Facebook — suporte introduzido

A API oficial Meta usa três fases para Reels de Páginas:
`video_reels/start`, envio de vídeo para o URL devolvido por Meta,
`video_reels/finish`. O publicador utiliza URLs temporários assinados e
aceita como destino de upload apenas `https://rupload.facebook.com`.
Depois do pedido de publicação, consulta o estado e **não elimina o vídeo**
se a publicação ainda estiver em processamento ou com resultado ambíguo.
Nessa situação o canal fica em revisão, sem nova publicação automática.
A confirmar em testes reais: requisitos de proporção 9:16, duração,
permissões e estados finais devolvidos pela versão Meta Graph aprovada.

A configuração inicial DUIT/Seven não impede adicionar mais clientes no
futuro. O administrador liga cada Página por autorização Meta e escolha
explícita. O portal não cria contas novas na Meta.

## Verificação de infraestrutura — 12/11/2026

Inspeção **apenas de leitura** do projeto Railway `Portal cliente`:
- Serviço `portal-cliente` ligado à branch `main`.
- Uma réplica em produção; volume `portal-cliente-volume` montado em `/data`.
- `DATABASE_PATH` já existe nas variáveis.
- Ainda sem variáveis `DUIT_META_*`, `DUIT_VAPID_*`,
  `DUIT_SOCIAL_PUBLISH_ENABLED` ou `DUIT_SOCIAL_MEDIA_SIGNING_KEY`.

Não criar automaticamente credenciais Meta: têm de ser obtidas na app
Meta Developers, com URI OAuth e permissões apropriadas. Não ativar o motor
nem fazer deploy enquanto faltarem esses pré-requisitos e testes reais.

## Melhorias de revisão — 13/11/2026

- OAuth percorre as Páginas Meta por cursor, em blocos de 100, com limite
  de segurança de 20 páginas de resultados. Não segue URLs `paging.next`
  devolvidos por terceiros e não importa automaticamente qualquer Página.
- Legendas e data/hora de rascunhos podem ser editadas. Um agendamento pode
  ser reagendado enquanto estiver em `scheduled`; depois de o worker o
  marcar `processing`, deixa de aceitar alterações.
- A edição de agendamentos exige que a publicação Meta esteja ativada, para
  evitar aparentar sucesso se o motor estiver desligado.
- GitHub Actions execução #44: testes técnicos passaram; testes de ponta a
  ponta com contas Meta reais continuam por fazer.

**Não foi efetuado deploy, nem enviadas publicações reais.**

## Recuperação de publicações ambíguas — 13/11/2026

O publicador **nunca repete automaticamente** um envio cujo resultado Meta
seja desconhecido (timeout, perda de rede, reinício do processo). Nesses
casos a publicação fica em `review`, com estados independentes por rede.

No painel, o administrador verifica primeiro a publicação na Meta:
- **Já publicado**: indica o ID real do conteúdo e confirma apenas esse canal.
- **Não publicado**: depois de verificar a ausência do conteúdo, autoriza
  uma nova tentativa apenas nesse canal.
- **Retomar canais não iniciados**: disponível somente quando existem canais
  `pending` e nenhum outro canal com resultado incerto.

Assim, uma publicação concluída no Facebook não volta a ser enviada ao
Facebook se o Instagram falhar. Os ficheiros só são apagados depois de
confirmada a publicação em todos os canais selecionados.

O serviço também converte publicações interrompidas em `review` no arranque,
sem repetir automaticamente o envio. Esta é uma salvaguarda inicial, não
uma garantia de reconciliação automática com a Meta; realizar testes de
integração antes de ativar na produção.

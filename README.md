# NEXUS Forense

Workspace investigativo em formato PWA para organizar casos, fontes públicas, evidências, conexões e rascunhos de laudos técnicos.

## O que existe na V1

- Conta local com nome, e-mail e senha, sem serviços externos.
- Persistência por `localStorage`, organizada em uma camada de armazenamento substituível no futuro por Firebase.
- Dashboard com indicadores calculados a partir dos dados reais do navegador.
- CRUD de investigações, pessoas, informações relevantes, veículos, eventos, evidências e fontes.
- Linha do tempo cronológica, busca global e mural de relações por investigação.
- Estados vazios para iniciar o uso sem dados fictícios.
- Manifesto e service worker básicos para instalação como PWA.

Esta versão é destinada a uso pessoal local. Os dados permanecem no armazenamento do navegador e não são enviados para serviços externos. A senha usa um hash leve adequado apenas para esse cenário local; autenticação robusta e sincronização ficam para uma etapa futura.

## Executar localmente

1. Instale as dependências com `npm ci`.
2. Inicie o ambiente de desenvolvimento com `npm run dev`.
3. Valide a tipagem com `npm run check` e gere a versão de produção com `npm run build`.

## Publicar no GitHub Pages

O endereço `github.com/jailtoncp/NEXUS-FORENSE` é a página do código-fonte e, por isso, exibe este README. O aplicativo é publicado em uma URL separada do GitHub Pages.

Após enviar o projeto para a branch `main`, o workflow em `.github/workflows/deploy.yml` executa o build e publica automaticamente o app. No GitHub, abra **Settings → Pages**, selecione **GitHub Actions** como origem e aguarde a conclusão do workflow. A URL do aplicativo será mostrada no job de deploy e seguirá o formato `https://jailtoncp.github.io/NEXUS-FORENSE/`.

Não abra apenas a URL do repositório esperando ver o app: essa URL continuará exibindo o README por definição.

## Próxima etapa recomendada

Migrar a camada de armazenamento para Firebase Authentication, Firestore e Storage, além de adicionar upload de arquivos, permissões por caso, auditoria, MFA, criptografia e retenção. O código atual mantém entidades com `ownerId` e `investigationId` para facilitar essa evolução.

## Licença e uso

Projeto de uso pessoal. Evite inserir dados pessoais reais em ambientes compartilhados ou publicar o diretório de dados do navegador.

# Relatório técnico — NEXUS Forense V3

**Data:** 19/09/2026  
**Escopo:** versão local atualizada e pacote preparado para substituir a publicação anterior.  
**Objetivo:** documentar o que está efetivamente implementado no código, como os dados são armazenados e quais recursos podem ser usados na investigação.

## Resultado da auditoria

A V3 contém os recursos de investigação e perícia solicitados. A interface original foi preservada e o ambiente interno de cada caso agora possui as abas **Laudos**, **Ferramentas** e **Anexos**. Os dados continuam separados por usuário e investigação.

O problema observado na versão pública anterior não era apenas visual. A publicação estava servindo um bundle antigo. Por isso, a V3 inclui novamente uma cópia compilada na raiz do projeto, com `index.html`, `assets/`, `manifest.json`, `sw.js`, `404.html` e `.nojekyll`. O pacote precisa substituir os arquivos do repositório remoto para que a URL pública passe a carregar a V3.

## Módulos do aplicativo

### 1. Conta e sessão local

A tela inicial permite criar conta com nome, e-mail e senha e entrar novamente com essas credenciais. A sessão fica registrada localmente. Não existe login Google, Firebase Authentication ou envio de credenciais para servidores.

O hash atual é leve e serve apenas para o cenário pessoal local. Ele não deve ser tratado como mecanismo de autenticação de produção.

### 2. Dashboard

O dashboard apresenta números calculados a partir dos dados reais do navegador. Os indicadores cobrem investigações, casos ativos, casos concluídos, casos arquivados, pessoas, veículos, eventos, evidências, laudos e diligências.

O aplicativo começa vazio. Quando não há registros, o dashboard mostra zero e estados vazios, sem dados fictícios.

### 3. Investigações

Cada investigação contém título, tipo, descrição, status, número de processo, número de boletim, data de criação e data de atualização. Os tipos incluem Criminal, Homicídio, Desaparecimento, Fraude, Cível, Trabalhista, Administrativa, Empresarial, Acidente e Outro.

É possível criar, abrir, editar e excluir investigações. A exclusão remove os registros associados do caso, inclusive pessoas, veículos, eventos, evidências, fontes, informações, laudos, diligências e metadados de anexos.

### 4. Visão geral e informações relevantes

A visão geral apresenta os totais do caso e permite registrar informações flexíveis por rótulo e valor. É possível usar esse recurso para placas, RENAVAM, CPF, CNPJ, empresas, endereços, telefones, e-mails, processos, boletins, locais, datas e observações.

### 5. Pessoas

O cadastro de pessoas possui nome, papel, CPF, telefone, e-mail, endereço e observações. Os papéis disponíveis são Suspeito, Investigado, Vítima, Testemunha, Comunicante, Perito, Advogado, Autoridade e Outro.

Os registros podem ser criados, editados e removidos dentro da investigação aberta.

### 6. Veículos

O cadastro de veículos possui placa, marca, modelo, cor, RENAVAM, proprietário e observações. O registro permanece vinculado ao caso e pode ser editado ou removido.

### 7. Linha do tempo

A linha do tempo registra data, título, descrição, categoria e observações. As categorias são Ocorrência, Depoimento, Perícia, Movimentação judicial, Diligência, Reunião e Outro. Os eventos são exibidos em ordem cronológica.

### 8. Evidências

A aba de evidências registra identificação, categoria, descrição, origem, data, nível de confiança e observações. As categorias são Documento, Foto, Vídeo, Áudio, Material, Digital, Testemunhal e Outro.

O cadastro descritivo permanece separado do módulo de anexos. Isso permite registrar uma evidência e, quando necessário, anexar a fotografia, digitalização ou documento correspondente.

### 9. Fontes

O cadastro de fontes registra nome, categoria, descrição, URL, data, nível de confiança e observações. As categorias são Oficial, Pública, Privada, Denúncia e Outro.

### 10. Laudos, pareceres e relatórios

A aba **Laudos** cria documentos técnicos vinculados à investigação. Os tipos disponíveis são:

- Laudo técnico;
- Parecer técnico;
- Relatório investigativo.

Cada documento possui status Rascunho, Em revisão ou Concluído. Os campos técnicos são título, data, responsável, objetivo, metodologia, achados e análise, conclusão, recomendações e observações.

O documento pode ser editado, excluído, impresso pelo navegador e copiado para a área de transferência. A função de cópia gera um texto consolidado com identificação do caso e todas as seções preenchidas.

O aplicativo não inventa conclusões, não atesta resultados e não substitui revisão profissional, assinatura, validação pericial ou cadeia de custódia.

### 11. Ferramentas investigativas e periciais

A aba **Ferramentas** contém diligências operacionais. Ela pode ser utilizada para registrar:

- solicitação de perícia;
- entrevista ou depoimento;
- requisição de documento;
- consulta a fonte;
- revisão de evidência;
- análise de dispositivo;
- diligência de campo;
- acompanhamento de prazo judicial;
- qualquer outra providência do caso.

Cada item possui título, categoria, status, prioridade, prazo, responsável e observações. Os status são Planejada, Em andamento, Concluída e Cancelada. As prioridades são Baixa, Média, Alta e Urgente.

### 12. Anexos locais reais

A aba **Anexos** implementa upload de arquivos do dispositivo. O usuário escolhe uma categoria e pode informar uma descrição antes de anexar o arquivo.

As categorias disponíveis são:

- Foto;
- Impressão digital;
- Laudo toxicológico;
- Laudo pericial;
- Documento;
- Áudio;
- Vídeo;
- Outro.

Cada anexo exibe nome, categoria, tamanho, tipo MIME, data e descrição. O arquivo pode ser baixado novamente ou excluído.

O limite atual é de 50 MB por arquivo. O conteúdo binário é salvo no IndexedDB do navegador, enquanto os metadados ficam no `localStorage`. Essa separação evita colocar arquivos grandes diretamente em uma string de `localStorage`.

O módulo serve para fotos, imagens de digitais, PDFs, documentos de laboratório, laudos toxicológicos, áudios de entrevista e vídeos. O aplicativo não interpreta automaticamente o conteúdo do arquivo. OCR, extração de metadados, hash forense e análise automatizada permanecem como evoluções futuras.

### 13. Mural de relações

O mural organiza visualmente os elementos reais cadastrados no caso. Ele exibe pessoas, veículos, eventos, evidências e fontes. A estrutura atual permite evoluir para relações explícitas entre Pessoa, Veículo, Local, Evento, Evidência e Documento.

### 14. Busca global

A busca pesquisa investigações, pessoas, veículos, eventos, evidências, fontes, informações relevantes, laudos e diligências. A consulta considera títulos, descrições, categorias, status, prioridades, responsáveis, identificadores e observações.

Os resultados indicam o tipo de registro e levam o usuário ao caso relacionado.

## Armazenamento

A aplicação usa os seguintes espaços locais:

| Dados | Armazenamento |
| --- | --- |
| Conta e sessão | `localStorage` |
| Investigações | `localStorage` |
| Pessoas, veículos e eventos | `localStorage` |
| Evidências, fontes e informações | `localStorage` |
| Laudos e diligências | `localStorage` |
| Metadados dos anexos | `localStorage` |
| Conteúdo binário dos anexos | IndexedDB |

A camada de armazenamento continua isolada em serviços próprios para facilitar uma futura migração para Firebase Authentication, Firestore e Storage.

## Arquivos principais

| Arquivo | Responsabilidade |
| --- | --- |
| `client/src/pages/InvestigationDetail.tsx` | Ambiente interno do caso e novas abas |
| `client/src/lib/types.ts` | Tipos de dados e opções de categorias |
| `client/src/lib/storage.ts` | CRUD, busca e cascata de exclusão |
| `client/src/lib/attachments.ts` | Upload e persistência de arquivos no IndexedDB |
| `client/src/pages/Dashboard.tsx` | Indicadores e lista de investigações |
| `client/src/components/AppShell.tsx` | Navegação, tema e busca global |
| `client/public/favicon.svg` | Marca vetorial do aplicativo |
| `index.html` e `assets/` | Build publicável na raiz do GitHub Pages |

## Identidade visual

O novo ícone combina quatro referências visuais: escudo para proteção e integridade, impressão digital para identificação, lente para análise e azul profundo para investigação técnica. Há versões SVG, PNG 192x192 e PNG 512x512 para navegador e PWA.

## Validação técnica

A V3 foi validada com `npm run check`, que concluiu sem erros TypeScript. O build foi executado com `VITE_BASE_PATH=/NEXUS-FORENSE/`. A cópia publicável foi servida por HTTP e os arquivos principais responderam com sucesso.

Foram verificados o `index.html`, o bundle JavaScript, o CSS, o manifest, o service worker, o favicon, os dois ícones e o relatório. O ZIP final foi testado com `unzip -t`.

## Limitações e segurança

Os arquivos permanecem somente no navegador. Limpar os dados do site, trocar de dispositivo ou usar outro navegador não transporta automaticamente os dados. Recomenda-se não usar computadores compartilhados para dados pessoais ou sensíveis.

Ainda não há criptografia local, sincronização, múltiplos usuários, permissões remotas, assinatura digital, cadeia de custódia formal, OCR, análise automática de impressões digitais, classificação toxicológica, consulta a bancos externos ou auditoria imutável.

## Publicação

A versão pública somente mudará depois que o conteúdo do ZIP for enviado à branch `main` do repositório. A entrega contém a cópia compilada na raiz, portanto pode ser publicada com **Deploy from a branch → main → root**. O workflow de GitHub Actions também está incluído.

## Referências

[1]: https://github.com/jailtoncp/NEXUS-FORENSE "Repositório do NEXUS Forense"

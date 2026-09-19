# Relatório técnico — NEXUS Forense V4

**Data:** 19/09/2026  
**Base:** evolução incremental da V3 existente.  
**Modo:** local-first, sem Firebase, backend remoto ou envio de arquivos para serviços externos.

## 1. Resumo da entrega

A V4 preserva o login local, dashboard, investigações, pessoas, veículos, eventos, evidências, fontes, laudos, diligências, mural, busca global, anexos e PWA da V3. A evolução foi adicionada ao mesmo projeto, sem recriação da interface.

A nova aba **Perícia V4** reúne cadeia de custódia, impressões digitais, documentos, locais, hashes, relatório de integridade e exportação JSON. Os arquivos agora recebem SHA-256 no dispositivo e, para imagens compatíveis, o sistema mantém o original e gera cópias de preview e thumbnail.

A aba de evidências recebeu categorias periciais ampliadas, código, subcategoria e status. O workspace V4 permite vincular diretamente foto ou vídeo a cada evidência, sem depender somente da aba geral de anexos.

## 2. Funcionalidades preservadas da V3

O aplicativo mantém conta e sessão local, dashboard, criação e edição de investigações, pessoas, veículos, linha do tempo, evidências, fontes, informações relevantes, laudos técnicos, pareceres técnicos, relatórios investigativos, diligências, mural de relações, busca global, anexos gerais, manifest PWA, service worker e publicação no GitHub Pages.

A aplicação continua iniciando vazia para uma conta nova. Nenhum caso fictício é inserido no código final.

## 3. Evidências V4

A evidência continua sendo um registro estruturado com nome, categoria, descrição, origem, confiança, data e observações. A V4 adiciona os campos opcionais código, subcategoria, local de coleta, hora de coleta, responsável pela coleta, responsável pelo cadastro, status e vínculos para evento, pessoa, veículo e local.

As categorias agora incluem Documento, Foto, Vídeo, Áudio, Material, Digital, Material biológico, Vestígio, Dispositivo eletrônico, Impressão digital, Arma/objeto, Documento financeiro, Documento digital, Testemunhal e Outro.

Os status disponíveis são Registrada, Em análise, Preservada e Arquivada. Os campos opcionais preservam registros criados na V3 porque foram adicionados de forma compatível.

## 4. Arquivos vinculados diretamente à evidência

Na aba **Perícia V4**, cada evidência possui um controle próprio para adicionar foto ou vídeo. O arquivo é salvo com `evidenceId`, podendo ser identificado e listado como vinculado ao registro correspondente.

O arquivo original não é substituído. A interface mostra os nomes dos arquivos vinculados e informa quando existe SHA-256. O download do original continua disponível pela aba geral de anexos.

## 5. Upload, imagens e vídeos

O serviço `client/src/lib/attachments.ts` usa IndexedDB para armazenar os blobs e `localStorage` para os metadados. O limite operacional atual é de 100 MB por arquivo. Arquivos acima desse limite geram mensagem de erro e não são salvos.

Para imagens compatíveis com `createImageBitmap`, o sistema detecta dimensões, mantém o original e gera uma cópia JPEG de preview com lado máximo aproximado de 1600 pixels e uma thumbnail com lado máximo aproximado de 320 pixels. Preview e thumbnail possuem seus próprios registros no IndexedDB e são marcados com as funções `preview` e `thumbnail`.

JPG, JPEG, PNG, WEBP e outros formatos suportados pelo navegador podem ser processados. HEIC e HEIF são mantidos como originais quando o navegador não consegue decodificá-los. O sistema não declara que um formato foi convertido quando o processamento não ocorreu.

Vídeos são armazenados sem recompressão destrutiva. O navegador pode reproduzir formatos compatíveis quando uma interface de visualização for adicionada; o arquivo original permanece disponível para download. A V4 não tenta converter vídeos grandes.

## 6. Hash de integridade

Cada arquivo original recebe SHA-256 usando `crypto.subtle.digest` no dispositivo. O registro contém algoritmo implícito SHA-256, hash, data do cálculo, tamanho original e tipo MIME. Preview e thumbnail também recebem hashes próprios quando são criados.

A aba Perícia V4 informa quantos arquivos possuem hash e oferece um relatório de integridade em texto para download. O serviço também possui função de recálculo de hash para comparar o valor atual com o valor registrado.

> Um hash correspondente indica correspondência dos bytes verificados. Ele não prova autenticidade jurídica, autoria, origem ou ausência de manipulação antes do primeiro cálculo.

## 7. Cadeia de custódia

A cadeia de custódia é uma seção associada à investigação e a uma evidência específica. Cada movimentação registra evidência, data, hora, responsável, origem, destino, ação, descrição, condição e observações.

As ações disponíveis são Coleta, Recebimento, Identificação, Acondicionamento, Transporte, Armazenamento, Entrega, Análise, Devolução, Descarte e Outro. O histórico é exibido em ordem de criação e pode ser removido pelo usuário local.

A interface apresenta um aviso explícito de que esse recurso é um registro digital auxiliar. A aplicação não cria assinatura, validação oficial ou conclusão jurídica automaticamente.

## 8. Impressões digitais

A nova seção de impressões digitais permite cadastrar dedo, mão, classificação, qualidade, local de coleta, data, responsável, método e observações. Os métodos podem ser descritos como tinta, pó, fotografia, scanner, levantamento papiloscópico ou outro.

O sistema foi deliberadamente limitado à organização dos registros e dos arquivos. Não existe reconhecimento automático, algoritmo fictício de comparação ou afirmação de que duas impressões pertencem à mesma pessoa.

## 9. Documentos e locais

Documentos relacionados podem ser cadastrados com nome, tipo, descrição, origem, data, número, responsável e observações. O campo de tipo aceita BO, processo, ofício, laudo, relatório, documento pessoal, empresarial, bancário, judicial, administrativo ou outro por texto livre.

Locais podem ser cadastrados com nome, endereço, referência, latitude, longitude, descrição e observações. O uso de coordenadas é manual e não exige mapa externo.

## 10. Integridade e exportação

A V4 oferece exportação JSON da investigação com versão do pacote, data de exportação, investigação, evidências, cadeia de custódia, impressões, documentos, locais e metadados dos arquivos originais. O conteúdo binário não é embutido no JSON; os blobs permanecem no IndexedDB. O JSON é um backup estrutural, não um pacote completo de mídia.

Também é possível gerar um relatório textual de integridade contendo arquivo, tamanho, SHA-256, data do cálculo e status de verificação.

A importação estruturada de pacotes `.nexus` e ZIP ainda não foi incluída nesta etapa. O JSON exportado não deve sobrescrever uma investigação sem uma rotina de validação e confirmação explícita.

## 11. Auditoria

A nova camada possui uma entidade de auditoria local e já registra a atualização da cadeia de custódia. A estrutura está preparada para registrar criação de evidência, inclusão ou remoção de arquivo, criação ou edição de laudo, conclusão de diligência e ações semelhantes.

A auditoria atual é local e editável pelo próprio armazenamento do navegador. Ela não é trilha imutável e não substitui um sistema corporativo de auditoria.

## 12. Armazenamento

| Conteúdo | Armazenamento |
| --- | --- |
| Usuários e sessão | localStorage |
| Investigações e entidades estruturadas | localStorage |
| Metadados dos anexos | localStorage |
| Original, preview e thumbnail | IndexedDB |
| SHA-256 | localStorage junto aos metadados |

A separação preserva a arquitetura local-first e deixa pontos claros para futura substituição por Firestore e Firebase Storage sem reescrever toda a interface.

## 13. Arquivos criados ou alterados

| Arquivo | Alteração |
| --- | --- |
| `client/src/lib/types.ts` | Modelos V4 e categorias periciais |
| `client/src/lib/attachments.ts` | SHA-256, imagens, previews, thumbnails e vínculos |
| `client/src/lib/storage.ts` | Stores de custódia, digitais, documentos, locais e auditoria |
| `client/src/components/ForensicsTab.tsx` | Workspace Perícia V4 |
| `client/src/pages/InvestigationDetail.tsx` | Aba Perícia V4 e evidências ampliadas |
| `client/src/App.tsx` | Base path do roteador Wouter para GitHub Pages |
| `RELATORIO-NEXUS-FORENSE-V4.md` | Este relatório |
| `README.md` | Documentação de funcionamento local e V4 |
| `index.html`, `assets/`, `manifest.json`, `sw.js` | Build de publicação |

## 14. Privacidade e limitações

Nenhum arquivo é enviado para APIs externas. Não há OCR online, reconhecimento facial, reconhecimento de impressões digitais, consulta automática a bases externas ou Firebase.

O armazenamento local não substitui um sistema corporativo seguro. Limpar os dados do navegador, trocar de dispositivo ou usar outro navegador pode tornar os dados inacessíveis. Para dados sensíveis, o usuário deve controlar o dispositivo e criar backups manuais.

A V4 ainda não possui importação de pacote, galeria ampliada com zoom e fullscreen, navegação entre imagens, drag-and-drop com progresso visual, duração/resolução de vídeo em todos os formatos, versionamento completo de documentos, relações explícitas entre todas as entidades e timeline unificada automática de todos os módulos.

## 15. Testes executados

Foi executado `npm run check` após os novos modelos, serviço de arquivos e componente de perícia. A checagem TypeScript passou sem erros.

Foi executado `VITE_BASE_PATH=/NEXUS-FORENSE/ npm run build`. O build de produção passou e gerou bundle JavaScript, CSS e `index.html` com o prefixo do GitHub Pages.

A validação funcional prioritária confirmou a presença no código de anexos vinculados à evidência, SHA-256, preview, thumbnail, cadeia de custódia, impressões digitais, documentos, locais, relatório de integridade e exportação.

## 16. Publicação

A cópia publicável deve ser gerada na raiz com `index.html`, `404.html`, `assets/`, `.nojekyll`, manifest, service worker e ícones. Para publicar no GitHub Pages, os arquivos precisam ser enviados à branch configurada do repositório `jailtoncp/NEXUS-FORENSE`.

A URL esperada continua sendo:

`https://jailtoncp.github.io/NEXUS-FORENSE/`

## Referências

[1]: https://github.com/jailtoncp/NEXUS-FORENSE "Repositório do NEXUS Forense"

# Relatório técnico — NEXUS Forense V2

**Data da auditoria:** 19/09/2026  
**Escopo:** versão local do projeto e pacote preparado para publicação estática no GitHub Pages.  
**Objetivo:** registrar o que está integrado no aplicativo, como os dados são persistidos, quais fluxos foram validados e quais capacidades permanecem para uma etapa futura.

## Conclusão executiva

A V2 mantém a interface original do NEXUS Forense e amplia o ambiente interno de cada investigação com duas áreas novas: **Laudos e pareceres** e **Ferramentas investigativas**. Os novos registros são vinculados ao usuário e à investigação, persistidos no `localStorage`, aparecem na busca global e são removidos junto com a investigação em uma exclusão em cascata.

A aplicação continua sendo uma solução local. Não há Firebase, banco remoto, backend online, login Google, envio de dados para terceiros ou upload de arquivos. O pacote também contém uma cópia de produção na raiz do repositório para funcionar quando o GitHub Pages estiver configurado como publicação direta da branch.

## Funcionalidades integradas

### Acesso e conta local

A tela de acesso mantém a identidade visual existente e oferece criação de conta local com nome, e-mail e senha. O login compara o e-mail e um hash leve da senha armazenado localmente. A sessão ativa é mantida em `localStorage`, permitindo reabrir o aplicativo no mesmo navegador sem recriar a conta.

Esse mecanismo é adequado apenas para uso pessoal local. Ele não substitui autenticação segura de produção. A estrutura foi mantida atrás de `AuthContext` e do serviço de armazenamento para permitir uma futura migração para Firebase Authentication.

### Dashboard

O dashboard apresenta indicadores calculados a partir dos registros reais do usuário. Os cartões existentes cobrem investigações, casos ativos, casos concluídos, casos arquivados, pessoas, veículos, eventos e evidências. A V2 adiciona os contadores de **Laudos** e **Diligências**.

Quando não há registros, os valores permanecem em zero e a lista exibe estados vazios. Não há dados demonstrativos inseridos automaticamente.

### Investigações

A investigação continua sendo o elemento central do aplicativo. É possível criar, abrir, editar e excluir investigações. Cada uma possui título, tipo, status, descrição, número de processo, número de boletim, data de criação e data de atualização.

Os tipos disponíveis incluem Criminal, Homicídio, Desaparecimento, Fraude, Cível, Trabalhista, Administrativa, Empresarial, Acidente e Outro. Os status disponíveis incluem Ativa, Concluída, Arquivada e Pausada.

### Informações relevantes

A aba de visão geral permite registrar pares flexíveis de rótulo e valor. Esse recurso pode armazenar placas, RENAVAM, CPF, CNPJ, empresas, endereços, telefones, e-mails, números de processos, boletins, locais e observações sem obrigar um formulário rígido.

### Pessoas

A aba de pessoas permite cadastrar várias pessoas na mesma investigação. Cada registro possui nome, papel, CPF, telefone, e-mail, endereço e observações. Os papéis disponíveis incluem suspeito, investigado, vítima, testemunha, comunicante, perito, advogado, autoridade e outro.

Os registros podem ser criados, editados e removidos. A lista é sempre filtrada pela investigação aberta.

### Veículos

A aba de veículos permite cadastrar placa, marca, modelo, cor, RENAVAM, proprietário e observações. Os veículos permanecem vinculados à investigação correspondente e possuem operações de criação, edição e exclusão.

### Linha do tempo

A linha do tempo permite registrar data, título, descrição, categoria e observações. Os eventos são ordenados cronologicamente e podem representar ocorrências, depoimentos, perícias, movimentações judiciais, diligências, reuniões e outros acontecimentos.

### Evidências

A aba de evidências permite registrar identificação, categoria, descrição, origem, data, nível de confiança e observações. As categorias incluem documento, foto, vídeo, áudio, material, digital, testemunhal e outro.

O aplicativo não implementa upload de arquivos nesta etapa. Isso evita uma solução frágil para armazenamento de documentos e laudos. O cadastro descritivo permanece funcional e persistido.

### Fontes

A aba de fontes permite registrar nome, categoria, descrição, URL, data, nível de confiança e observações. As categorias disponíveis são oficial, pública, privada, denúncia e outra.

### Laudos, pareceres e relatórios

A V2 adiciona a aba **Laudos** ao ambiente interno da investigação. Ela permite gerar e manter documentos técnicos locais com os seguintes campos:

- título;
- tipo: Laudo técnico, Parecer técnico ou Relatório investigativo;
- status: Rascunho, Em revisão ou Concluído;
- data;
- responsável;
- objetivo;
- metodologia;
- achados e análise;
- conclusão;
- recomendações;
- observações.

Cada documento pode ser editado e excluído. A interface também oferece cópia do texto consolidado para a área de transferência e impressão pelo navegador. O texto copiado inclui a identificação do caso, o tipo do documento, o responsável e todas as seções técnicas preenchidas.

A geração é local e manual. O aplicativo não afirma conclusões automaticamente e não substitui revisão profissional, assinatura, cadeia de custódia ou validação pericial.

### Ferramentas investigativas e periciais

A V2 adiciona a aba **Ferramentas** com uma lista de diligências. Ela serve como um painel operacional para registrar ações como solicitar perícia, entrevistar testemunha, requisitar documento, revisar evidência, consultar fonte ou acompanhar uma providência judicial.

Cada diligência possui título, categoria, status, prioridade, prazo, responsável e observações. Os status são Planejada, Em andamento, Concluída e Cancelada. As prioridades são Baixa, Média, Alta e Urgente.

A estrutura pode evoluir para checklists especializados de informática forense, documentoscopia, local de crime, cadeia de custódia e análise financeira sem alterar o princípio atual de dados locais vinculados à investigação.

### Mural de relações

O mural existente preserva a ideia visual de conexão entre elementos reais do caso. Ele utiliza as pessoas, veículos, eventos, evidências e fontes cadastrados. A estrutura de dados mantém `ownerId` e `investigationId`, permitindo evoluir futuramente para relações explícitas entre entidades.

### Busca global

A busca global pesquisa os registros reais do usuário. Ela cobre investigações, pessoas, veículos, eventos, evidências, fontes, informações relevantes, laudos e diligências. Os campos pesquisados incluem títulos, descrições, identificadores, categorias, responsáveis, prioridades, status, observações e dados de contato quando aplicável.

Os resultados indicam o tipo do registro e levam o usuário à investigação relacionada.

## Persistência e arquitetura

A camada `client/src/lib/storage.ts` é o único ponto de acesso aos dados persistidos. Ela usa uma fábrica genérica de CRUD para aplicar filtros por usuário, investigação, criação, edição, exclusão e exclusão em cascata.

As chaves locais relevantes são:

| Entidade | Chave de armazenamento |
| --- | --- |
| Usuários | `nexus:users` |
| Sessão | `nexus:session` |
| Investigações | `nexus:investigations` |
| Pessoas | `nexus:people` |
| Veículos | `nexus:vehicles` |
| Eventos | `nexus:events` |
| Evidências | `nexus:evidence` |
| Fontes | `nexus:sources` |
| Informações relevantes | `nexus:relevant_info` |
| Laudos e pareceres | `nexus:reports` |
| Diligências | `nexus:diligences` |

Essa organização facilita uma futura troca de `localStorage` por Firestore. A camada ainda não fornece criptografia, sincronização, controle de acesso remoto ou auditoria imutável.

## PWA e publicação

O projeto mantém `manifest.json`, `sw.js`, favicon e ícones PNG de 192 e 512 pixels. A versão publicável também contém `index.html`, `404.html`, `assets/` e `.nojekyll` na raiz do repositório.

O `index.html` da raiz aponta para o bundle compilado com o prefixo `/NEXUS-FORENSE/`. Essa cópia permite que o GitHub Pages publique o app diretamente a partir da raiz da branch. O workflow em `.github/workflows/deploy.yml` também permanece disponível para publicação por GitHub Actions.

O novo ícone combina uma impressão digital, um escudo de evidência e uma lente de análise. A composição foi criada para representar investigação, identificação e perícia em um símbolo simples, legível em tamanhos de favicon e instalação PWA.

## Validações realizadas

A versão local foi validada com `npm run check`, que concluiu sem erros de TypeScript. O build de produção foi executado com `VITE_BASE_PATH=/NEXUS-FORENSE/`. A raiz publicável foi servida por HTTP e respondeu com o `index.html` do aplicativo, o elemento React `root` e o bundle atualizado.

Também foram verificados os retornos HTTP dos seguintes arquivos: JavaScript, CSS, manifest, service worker, favicon e os dois ícones PWA. O pacote final foi testado com `unzip -t` depois de ser gerado.

## Limitações atuais

A versão atual não implementa upload de arquivos, OCR, consulta automática a bases externas, assinatura digital, cadeia de custódia formal, criptografia local, sincronização entre dispositivos, múltiplos usuários, permissões por caso ou geração automática de conteúdo por inteligência artificial.

Também não há garantia de segurança para dados sensíveis em computadores compartilhados. O uso recomendado permanece restrito a um navegador e dispositivo sob controle do usuário, com backup manual do perfil ou exportação futura planejada.

## Próximas etapas recomendadas

A evolução mais segura é implementar exportação e importação de um pacote JSON criptografado, seguida por anexos com metadados de hash, cadeia de custódia, versionamento de documentos e trilha de auditoria. Depois podem ser adicionados templates específicos de laudo, checklists periciais por especialidade e migração opcional para Firebase Authentication, Firestore e Storage.

## Arquivos de referência

- Código da interface: `client/src/pages/InvestigationDetail.tsx`.
- Modelos: `client/src/lib/types.ts`.
- Persistência e busca: `client/src/lib/storage.ts`.
- Dashboard: `client/src/pages/Dashboard.tsx`.
- Navegação e busca: `client/src/components/AppShell.tsx`.
- Ícone vetorial: `client/public/favicon.svg`.
- Publicação estática: `index.html`, `assets/`, `manifest.json` e `sw.js` na raiz.

## Referências

[1]: https://github.com/jailtoncp/NEXUS-FORENSE "Repositório do NEXUS Forense"

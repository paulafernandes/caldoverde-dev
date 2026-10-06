# Caldo Verde — website e backoffice

Website público multilingue (es/pt/en) de um restaurante de comida portuguesa e backoffice próprio em `/admin`. Uma instalação por negócio. O restaurante é o primeiro caso, mas o núcleo (BusinessSettings, idiomas, media) deve continuar genérico.

## Stack (não migrar nem assumir outra)
- Next.js 16 com **Pages Router** (não App Router), React 19, JavaScript/JSX (TypeScript só no seed). CSS próprio e CSS Modules.
- Prisma 7 + SQLite (adapter better-sqlite3), Better Auth, zod. Cliente gerado em `src/generated/prisma` (não versionado).
- Não assumir Tailwind, Supabase, Firebase, PostgreSQL, Docker nem Vercel. Não há multi-tenant, reservas, pagamentos nem analytics: são só ideias futuras.

## Comandos
- `npm run dev` · `npm run build` · `npm run start` · `npm run lint` · `npm run format:check`
- Antes de dar uma tarefa por concluída: `npm run lint && npm run build`.
- O ficheiro de configuração do Prisma chama-se `prisma7.config.ts` (nome não padrão): confirma como `generate`/`migrate` são invocados antes de os correr.

## Arquitetura
- Admin: componente React → API em `src/pages/api/admin/**` → sessão (`getAdminSession`) + validação zod (`src/server/*Validation.js`) → serviço (`src/server/*Service.js`) → Prisma.
- A maioria das páginas obtém dados no servidor com `getServerSideProps`.
- Ementa e dados do negócio vêm da base de dados. Textos editoriais e de interface estão em `src/data/translations.js` (público) e `src/data/adminTranslations.js` (admin). Antes de alterar um texto, identifica a sua fonte.
- `src/data/menuCategories.js` é só a origem histórica do seed, não a fonte atual da ementa.

## Regras que não podes quebrar
- Toda a página e API de admin valida a sessão **no servidor** (`getAdminSession`). Esconder botões não chega.
- Ao browser só vai informação pública selecionada explicitamente (`getPublicBusinessSettings`). Nunca enviar o BusinessSettings completo (NIF, morada fiscal).
- Os idiomas vêm da configuração do negócio (`BusinessLanguage`). Não fixar `es`/`pt`/`en` em componentes. O idioma predefinido tem de estar ativo.
- Ementa: a subcategoria é opcional (`subcategoryId` pode ser null); apagar uma subcategoria não apaga os pratos; a subcategoria de um prato tem de pertencer à categoria do prato; `priceText` é texto e pode ser null (não converter em número). As atualizações de traduções fazem upsert e preservam as não editadas. Operações relacionadas usam transações.
- Uploads: JPEG/PNG/WebP até 5 MB, guardados em `UPLOADS_DIR` (fora do código, servidos pelo Nginx em `/uploads/`). Nunca apagar nem substituir essa pasta.
- A reautenticação do admin (`adminFetch`, `AdminReauthentication`) preserva o estado dos formulários. Não introduzir redirecionamentos ou recarregamentos que o percam.
- `primaryActionUrl` tem nome genérico de propósito. Não o renomear para "reservation".
- Não executar `prisma/seed.ts` em produção nem sem inspecionar os efeitos.
- Preservar o design público e a acessibilidade (skip link, ARIA, `prefers-reduced-motion`, textos alternativos) quando a tarefa for de dados ou backend.

## Como trabalhar comigo
- Responde em português de Portugal. Mensagens de commit em inglês, curtas e no imperativo.
- Passo a passo, com alterações pequenas. Primeiro explica a arquitetura, o problema e a razão; depois mostra a mudança concreta.
- Lê o ficheiro real antes de propor alterações. Nunca inventes ficheiros, endpoints, configurações nem resultados de testes. Distingue factos observados, hipóteses e recomendações.
- Em tarefas que tocam em vários ficheiros, começa por um plano e espera pela minha aprovação.
- Depois de cada fase, corre `npm run lint && npm run build`, mostra o resultado e espera que eu teste antes de avançar. Nunca digas que correste ou testaste algo que não correste.
- Trabalha sempre numa branch. Não faças push, merge, migrações nem alterações destrutivas sem pedido explícito, com as consequências explicadas.
- Não atualizes dependências nem mudes a arquitetura só para modernizar, sem uma necessidade concreta.
- Não leias nem imprimas `.env` ou outros segredos. Não te ligues ao servidor (VPS): quando um passo for para o VPS, dá-me o comando exato, identificado como "VPS", para eu o executar.
- Se faltar contexto, faz a pergunta mínima necessária em vez de assumir.

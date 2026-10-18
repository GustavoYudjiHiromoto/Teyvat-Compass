# Teyvat Compass

Guia pessoal para planejar times de Genshin Impact usando os personagens que você já tem. Este MVP roda localmente e salva sua seleção neste navegador.

## Requisitos

- Node.js 20.19+ ou 22.12+
- npm

## Executar

```bash
npm install
npm run dev
```

O Vite mostrará o endereço local no terminal.

## Build de produção

```bash
npm run build
npm run preview
```

## Ativar contas e sincronização

O modo sem configuração continua funcionando localmente. Para habilitar cadastro, login e sincronização entre dispositivos:

1. Crie um projeto Supabase e copie `.env.example` para `.env`.
2. Preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` com a URL do projeto e a chave publicável. Projetos que ainda usam a chave `anon` também podem usar `VITE_SUPABASE_ANON_KEY`.
3. No SQL Editor do projeto Supabase, execute `supabase/schema.sql` para criar a tabela e as políticas de acesso. Se você já executou uma versão anterior, rode o arquivo atualizado novamente; ele adiciona as colunas de Showcase e objetivos sem apagar o perfil existente.
4. Em **Authentication → URL Configuration**, inclua `http://localhost:5173` nas URLs de redirecionamento. Adicione também o endereço do site quando publicar.
5. Para habilitar a importação de Showcase, instale e autentique o [Supabase CLI](https://supabase.com/docs/guides/cli), vincule o projeto (`supabase link --project-ref SEU_PROJECT_REF`) e publique a função: `supabase functions deploy enka-showcase`. Execute o deploy novamente após atualizar a função.
6. Reinicie `npm run dev` e use o menu no topo para criar uma conta ou entrar.

No primeiro login sem perfil na nuvem, o elenco, as armas, o Showcase e os objetivos salvos localmente são copiados para a conta. A partir daí, alterações são sincronizadas. A tabela permite que cada usuário leia e altere apenas o próprio perfil. Nunca coloque uma chave `service_role` no frontend; use somente a chave pública.

## Escopo atual

- Seleção de personagens possuídos com salvamento automático em `localStorage`.
- Quatro sugestões iniciais de time, ranqueadas conforme os personagens marcados no elenco.
- Substitutos por função, sem repetir personagens, com explicação das trocas e posições ainda em falta.
- Builds iniciais por personagem nos times sugeridos, com armas alternativas, artefatos, atributos e links para os guias da KeqingMains.
- Marcação de armas possuídas, priorizadas nas recomendações; no modo local os dados ficam salvos neste navegador.
- Conta por e-mail e senha e sincronização opcional do elenco e das armas pelo Supabase.
- Importação dos personagens visíveis no Showcase público por UID, através da Enka.Network.
- Builds do Showcase com nível, constelação, arma, artefatos e atributos atuais, comparados às recomendações cadastradas.
- Objetivos pessoais para acompanhar personagens, armas, artefatos e exploração; metas criadas a partir de uma build incluem checklist de arma, conjunto de artefatos e atributos principais.
- Catálogo local de 121 personagens, com busca, filtros e retratos. Recomendações de times e builds ainda são curadas apenas para parte do elenco.

O Showcase não revela o inventário completo: só importa os personagens que o jogador deixou visíveis no perfil, e o perfil precisa estar público. O catálogo local inclui os personagens listados nos dados públicos da Enka.Network; dados básicos e ícones foram gerados a partir de `store/gi/avatars.json` e `store/gi/locs.json`. Os times e builds recomendados continuam sendo uma curadoria inicial limitada aos personagens que já têm recomendações cadastradas. O UID é consultado pela função Supabase autenticada; a resposta fica em cache neste navegador pelo TTL informado pela Enka. A Enka pode limitar consultas e a função precisa ser publicada para o recurso funcionar. A comparação mostra equipamento, atributos atuais e recomendações, sem calcular uma pontuação automática da build.

Os times, substituições e builds são uma curadoria inicial; as builds não são atualizadas por API nem otimizam automaticamente os itens da conta. Consulte os guias vinculados, pois as recomendações variam conforme equipe, rotação e versão do jogo. Sem configurar Supabase, elenco e armas ficam apenas no navegador atual. O projeto não coleta credenciais HoYoverse.

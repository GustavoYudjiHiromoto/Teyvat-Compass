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
3. No SQL Editor do projeto Supabase, execute `supabase/schema.sql` para criar a tabela e as políticas de acesso. Se você já executou uma versão anterior, rode o arquivo atualizado novamente; ele adiciona as colunas de Showcase, objetivos e formações personalizadas sem apagar o perfil existente.
4. Em **Authentication → URL Configuration**, inclua `http://localhost:5173` nas URLs de redirecionamento. Adicione também o endereço do site quando publicar.
5. Para habilitar a importação de Showcase, instale e autentique o [Supabase CLI](https://supabase.com/docs/guides/cli), vincule o projeto (`supabase link --project-ref SEU_PROJECT_REF`) e publique a função: `supabase functions deploy enka-showcase`. Execute o deploy novamente após atualizar a função.
6. Reinicie `npm run dev` e use o menu no topo para criar uma conta ou entrar.

### Assistente de times com OpenRouter

O assistente exige login, compara apenas formações já cadastradas e permite até 5 consultas por usuário por dia. No Supabase, execute novamente `supabase/schema.sql` para instalar o contador diário e a função segura de limite; depois, em **Project Settings → Edge Functions → Secrets**, adicione `OPENROUTER_API_KEY`. O modelo padrão é `openai/gpt-4.1-mini`; você pode definir `OPENROUTER_MODEL` para outro modelo que aceite JSON Schema. O limite de preço por chamada é de US$ 0,50/M tokens de entrada e US$ 2,00/M tokens de saída. Publique com `supabase functions deploy team-assistant`.

Cada solicitação envia somente o elenco, até oito formações candidatas e uma preferência de até 240 caracteres. A resposta fica limitada a 420 tokens, o roteamento recusa provedores acima de US$ 0,50 por milhão de tokens de entrada ou US$ 2,00 por milhão de saída, e provedores que permitem coleta de dados são excluídos. Erros HTTP do provedor devolvem a cota diária; se a conexão expirar após o envio, a cota pode ser consumida porque não dá para confirmar se o modelo processou o pedido. Defina um limite de gastos para a chave no painel do OpenRouter como proteção adicional; o limite diário por conta não substitui um teto global de gastos.

No primeiro login sem perfil na nuvem, o elenco, as armas, o Showcase, os objetivos e as formações personalizadas salvos localmente são copiados para a conta. A partir daí, alterações são sincronizadas. A tabela permite que cada usuário leia e altere apenas o próprio perfil. Nunca coloque uma chave `service_role` no frontend; use somente a chave pública.

## Escopo atual

- Seleção de personagens possuídos com salvamento automático em `localStorage`.
- Sugestões iniciais de time, ranqueadas conforme os personagens marcados no elenco, com um assistente opcional para comparar até oito formações cadastradas.
- Substitutos por função, sem repetir personagens, com explicação das trocas e posições ainda em falta; você pode escolher uma sugestão avaliada ou qualquer personagem do seu elenco em cada posição e restaurar a sugestão automática. Escolhas manuais não têm sinergia avaliada.
- Builds iniciais por personagem nos times sugeridos, com armas alternativas, artefatos, atributos e links para os guias da KeqingMains.
- Marcação de armas possuídas, priorizadas nas recomendações; no modo local os dados ficam salvos neste navegador.
- Preferências manuais de substituição salvas no navegador e sincronizadas entre dispositivos pelo Supabase quando a coluna `team_slot_preferences` estiver disponível.
- Conta por e-mail e senha e sincronização opcional do elenco e das armas pelo Supabase.
- Importação dos personagens visíveis no Showcase público por UID, através da Enka.Network.
- Builds do Showcase com nível, constelação, arma, artefatos e atributos atuais, comparados às recomendações cadastradas.
- Objetivos pessoais para acompanhar personagens, armas, artefatos e exploração; metas criadas a partir de uma build incluem checklist de arma, conjunto de artefatos e atributos principais.
- Calculadora de materiais de ascensão de personagens e armas por intervalo de níveis, com opção de salvar os itens como checklist no Meu plano. Usa a API pública do Genshin-DB, nomes em português e cache local de 7 dias; não inclui EXP de personagem nem materiais de talento.
- Catálogo local de 121 personagens, com busca, filtros e retratos. Recomendações de times e builds ainda são curadas apenas para parte do elenco.

O Showcase não revela o inventário completo: só importa os personagens que o jogador deixou visíveis no perfil, e o perfil precisa estar público. O catálogo local inclui os personagens listados nos dados públicos da Enka.Network; dados básicos e ícones foram gerados a partir de `store/gi/avatars.json` e `store/gi/locs.json`. Os times e builds recomendados continuam sendo uma curadoria inicial limitada aos personagens que já têm recomendações cadastradas. O UID é consultado pela função Supabase autenticada; a resposta fica em cache neste navegador pelo TTL informado pela Enka. A Enka pode limitar consultas e a função precisa ser publicada para o recurso funcionar. A comparação mostra equipamento, atributos atuais e recomendações, sem calcular uma pontuação automática da build.

Os times, substituições e builds são uma curadoria inicial; as builds não são atualizadas por API nem otimizam automaticamente os itens da conta. Consulte os guias vinculados, pois as recomendações variam conforme equipe, rotação e versão do jogo. Sem configurar Supabase, elenco e armas ficam apenas no navegador atual. O projeto não coleta credenciais HoYoverse.

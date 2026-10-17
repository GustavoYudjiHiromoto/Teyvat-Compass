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

## Escopo atual

- Seleção de personagens possuídos com salvamento automático em `localStorage`.
- Quatro sugestões iniciais de time, ranqueadas conforme os personagens marcados no elenco.
- Substitutos por função, sem repetir personagens, com explicação das trocas e posições ainda em falta.
- Catálogo local inicial de 18 personagens, com busca e filtros.
- Busca e filtros no catálogo local de personagens.

Os times e substituições são uma curadoria inicial, não recomendações atualizadas por API. Armas, artefatos e builds detalhadas ficam para uma próxima etapa. O projeto não coleta credenciais HoYoverse nem envia dados para servidor.

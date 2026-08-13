# MYNBA — Web Phase 1

Build web-first, sem OpenAI API e sem custos de API.

## Incluído
- UI responsiva moderna
- criação de jogador: país, altura, peso, posição, college, mão, archetype
- save/load com localStorage
- 30 equipas e rosters locais
- Team / Training / Stats / League / Draft
- jogo posse-a-posse e simulação rápida
- play-by-play, box stats, game log e standings

## Cloudflare Pages
1. Cria um repositório GitHub e coloca `index.html`, `styles.css`, `app.js` e `README.md` no root.
2. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git.
3. Seleciona o repositório.
4. Framework: None; Build command vazio; output `/`.
5. Deploy.

Terás um endereço `https://NOME.pages.dev`.

A próxima fase pode mover o estado para Cloudflare Workers + D1 para contas e saves online.

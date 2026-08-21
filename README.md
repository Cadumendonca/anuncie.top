# Seu Site em Alta

Ranking brasileiro de visibilidade paga. O valor confirmado pelo Mercado Pago define a posição pública do produto.

## Desenvolvimento local

1. Copie `.env.example` para `.env.local`.
2. Configure `DATABASE_URL` com um banco MySQL compatível.
3. Execute `npm install` e `npm run db:push`.
4. Execute `npm run dev`.

Sem banco ou credenciais de pagamento, a aplicação abre em modo de demonstração: a interface e o fluxo até o retorno pendente funcionam com dados locais, mas nenhuma cobrança é criada.

## Produção

- Vercel para a aplicação Next.js.
- PlanetScale MySQL para persistência.
- Mercado Pago Checkout Pro para Pix e cartão.
- Resend para links mágicos e e-mails transacionais.
- Upstash Redis para presença, limites e reservas.
- Ably para atualização do ranking em tempo real.

Configure no Mercado Pago o webhook HTTPS `/api/webhooks/mercado-pago` para eventos de pagamento, reclamação e chargeback. A URL de retorno não publica anúncios; somente um webhook assinado e reconciliado altera o ranking.

## Comandos

- `npm run dev`: servidor local.
- `npm run typecheck`: validação TypeScript.
- `npm test`: testes unitários.
- `npm run build`: geração Prisma e build de produção.

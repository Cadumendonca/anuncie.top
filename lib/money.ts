export const MIN_BID_CENTS = Number(process.env.MIN_BID_BRL ?? 2) * 100;

export function formatBRL(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0
  }).format(cents / 100);
}

export function assertWholeReal(cents: number) {
  if (!Number.isInteger(cents) || cents < MIN_BID_CENTS || cents % 100 !== 0) {
    throw new Error(`O lance deve ser um valor inteiro a partir de ${formatBRL(MIN_BID_CENTS)}.`);
  }
}

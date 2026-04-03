export function normalizeLojaItem(item) {
  const title = item.titulo ?? item.nome ?? `Item #${item.id ?? ''}`
  const priceCoins = Number(
    item.preco_coins ?? item.preco ?? item.coins ?? item.valor_coins ?? 0,
  )
  const stock =
    item.estoque ?? item.stock ?? item.quantidade_disponivel ?? null
  const canBuy =
    stock === null || stock === undefined || Number(stock) > 0

  return {
    id: item.id,
    title,
    priceCoins: Number.isFinite(priceCoins) ? priceCoins : 0,
    stock,
    canBuy,
  }
}

// Encodes real stock data (not decorative): fill width + color reflect how
// close a product is to being out of stock. Reused on product cards and the
// admin inventory view for a consistent at-a-glance signal.
export default function StockGauge({ stock, lowStockThreshold = 5 }) {
  const pct = Math.min(100, stock === 0 ? 0 : Math.max(8, Math.min(100, stock * 8)))
  const color =
    stock === 0 ? 'bg-signal-rust' : stock <= lowStockThreshold ? 'bg-safety-amber' : 'bg-leaf-green'

  const label = stock === 0 ? 'Out of stock' : stock <= lowStockThreshold ? `Only ${stock} left` : 'In stock'

  return (
    <div>
      <div className="stock-gauge">
        <div className={`stock-gauge-fill ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="mt-1 block font-mono text-xs text-iron-gray">{label}</span>
    </div>
  )
}

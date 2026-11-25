/** Formats a price in Indian style: ₹85 L, ₹3.25 Cr, ₹18,000/mo */
export function formatPrice(price, listingType) {
  let text
  if (price >= 1e7) text = `₹${trim(price / 1e7)} Cr`
  else if (price >= 1e5) text = `₹${trim(price / 1e5)} L`
  else text = `₹${price.toLocaleString('en-IN')}`
  return listingType === 'Rent' ? `${text}/mo` : text
}

const trim = (n) => Number(n.toFixed(2)).toString()

export const formatDate = (d) =>
  new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

export const timeAgo = (d) => {
  const s = (Date.now() - new Date(d).getTime()) / 1000
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)} min ago`
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`
  return `${Math.floor(s / 86400)} d ago`
}

export const PLACEHOLDER_IMG = '/samples/property-8.svg'

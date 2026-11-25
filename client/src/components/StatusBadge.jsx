const CLASS = {
  Available: 'green',
  'Under Offer': 'amber',
  Sold: 'red',
  Rented: 'red',
  New: 'blue',
  Contacted: 'amber',
  'Site Visit Scheduled': 'purple',
  Closed: 'gray',
}

export default function StatusBadge({ status }) {
  return <span className={`badge badge-${CLASS[status] || 'gray'}`}>{status}</span>
}

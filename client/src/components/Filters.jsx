import { useEffect, useState } from 'react'

/**
 * Search & filter panel. `values` is the current filter object (from the URL),
 * `onApply` is called with the new filters.
 */
export default function Filters({ meta, values, onApply }) {
  const [f, setF] = useState(values)
  useEffect(() => setF(values), [values])

  const update = (e) => setF({ ...f, [e.target.name]: e.target.value })
  const submit = (e) => {
    e.preventDefault()
    onApply(f)
  }
  const reset = () => onApply({})

  return (
    <form className="card form filters" onSubmit={submit}>
      <h3>Search &amp; Filter</h3>
      <label>
        Keyword
        <input name="q" value={f.q || ''} onChange={update} placeholder="e.g. metro, villa, Sector 62" />
      </label>
      <label>
        City / Location
        <select name="city" value={f.city || ''} onChange={update}>
          <option value="">Any city</option>
          {meta?.cities.map((c) => <option key={c}>{c}</option>)}
        </select>
      </label>
      <label>
        Locality
        <input name="locality" value={f.locality || ''} onChange={update} placeholder="e.g. Indirapuram" />
      </label>
      <label>
        Buy or Rent
        <select name="listingType" value={f.listingType || ''} onChange={update}>
          <option value="">Buy or Rent</option>
          <option value="Sale">Buy</option>
          <option value="Rent">Rent</option>
        </select>
      </label>
      <label>
        Property type
        <select name="propertyType" value={f.propertyType || ''} onChange={update}>
          <option value="">Any type</option>
          {meta?.propertyTypes.map((t) => <option key={t}>{t}</option>)}
        </select>
      </label>
      <div className="row-2">
        <label>
          Min price (₹)
          <input type="number" min="0" name="minPrice" value={f.minPrice || ''} onChange={update} placeholder="0" />
        </label>
        <label>
          Max price (₹)
          <input type="number" min="0" name="maxPrice" value={f.maxPrice || ''} onChange={update} placeholder="Any" />
        </label>
      </div>
      <label>
        Bedrooms
        <select name="bedrooms" value={f.bedrooms || ''} onChange={update}>
          <option value="">Any</option>
          {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}+ BHK</option>)}
        </select>
      </label>
      <label>
        Availability
        <select name="availability" value={f.availability || ''} onChange={update}>
          <option value="">Any status</option>
          {meta?.availability.map((a) => <option key={a}>{a}</option>)}
        </select>
      </label>
      <div className="row-2">
        <button type="button" className="btn btn-outline" onClick={reset}>Reset</button>
        <button className="btn btn-primary">Apply</button>
      </div>
    </form>
  )
}

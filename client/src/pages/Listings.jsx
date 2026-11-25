import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api, { errorMessage } from '../api'
import Filters from '../components/Filters'
import PropertyCard from '../components/PropertyCard'
import Pagination from '../components/Pagination'
import Loader from '../components/Loader'

const FILTER_KEYS = ['q', 'city', 'locality', 'listingType', 'propertyType', 'minPrice', 'maxPrice', 'bedrooms', 'availability']

export default function Listings() {
  const [params, setParams] = useSearchParams()
  const [meta, setMeta] = useState(null)
  const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // The URL is the source of truth so searches can be bookmarked/shared
  const filters = useMemo(
    () => Object.fromEntries(FILTER_KEYS.filter((k) => params.get(k)).map((k) => [k, params.get(k)])),
    [params],
  )
  const sort = params.get('sort') || 'newest'
  const page = Number(params.get('page')) || 1

  useEffect(() => {
    api.get('/properties/meta').then((r) => setMeta(r.data))
  }, [])

  useEffect(() => {
    setLoading(true)
    setError('')
    api
      .get('/properties', { params: { ...filters, sort, page, limit: 9 } })
      .then((r) => setData(r.data))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [filters, sort, page])

  const setQuery = (next) => {
    const clean = Object.entries(next).filter(([, v]) => v !== '' && v != null)
    setParams(new URLSearchParams(clean))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const title = filters.listingType === 'Rent' ? 'Properties for rent' : filters.listingType === 'Sale' ? 'Properties for sale' : 'All properties'

  return (
    <div className="container section listings-layout">
      <aside>
        <Filters meta={meta} values={filters} onApply={(f) => setQuery({ ...f, sort })} />
      </aside>

      <section>
        <div className="section-head">
          <div>
            <h1 className="h2">{title}{filters.city ? ` in ${filters.city}` : ''}</h1>
            <p className="muted">{loading ? 'Searching…' : `${data.total} propert${data.total === 1 ? 'y' : 'ies'} found`}</p>
          </div>
          <label className="sort">
            Sort by
            <select value={sort} onChange={(e) => setQuery({ ...filters, sort: e.target.value })}>
              <option value="newest">Newest first</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
              <option value="area_desc">Largest area</option>
            </select>
          </label>
        </div>

        {error && <p className="alert alert-error">{error}</p>}
        {loading ? (
          <Loader />
        ) : data.items.length === 0 ? (
          <div className="empty card">
            <h3>No properties match your search</h3>
            <p className="muted">Try removing some filters or widening the price range.</p>
            <button className="btn btn-primary" onClick={() => setQuery({})}>Clear filters</button>
          </div>
        ) : (
          <>
            <div className="grid">{data.items.map((p) => <PropertyCard key={p._id} property={p} />)}</div>
            <Pagination page={data.page} pages={data.pages} onChange={(n) => setQuery({ ...filters, sort, page: n })} />
          </>
        )}
      </section>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api, { errorMessage } from '../../api'
import Loader from '../../components/Loader'

const EMPTY = {
  title: '', description: '', price: '', listingType: 'Sale', propertyType: 'Apartment', availability: 'Available',
  location: { address: '', locality: '', city: '', pincode: '' },
  bedrooms: 0, bathrooms: 0, areaSqft: '', furnishing: 'Unfurnished', amenities: '', images: [], featured: false,
}

export default function PropertyForm() {
  const { id } = useParams()
  const editing = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY)
  const [files, setFiles] = useState([])
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(editing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!editing) {
      setForm(EMPTY)
      return
    }
    api
      .get(`/properties/${id}`)
      .then(({ data }) => setForm({ ...EMPTY, ...data.property, amenities: data.property.amenities.join(', ') }))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [id, editing])

  // Revoke object URLs for previews when files change
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files])
  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews])

  const update = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }
  const updateLoc = (e) => setForm({ ...form, location: { ...form.location, [e.target.name]: e.target.value } })

  const addFiles = (e) => {
    setFiles([...files, ...Array.from(e.target.files)].slice(0, 8))
    e.target.value = ''
  }
  const addImageUrl = () => {
    if (!imageUrl.trim()) return
    setForm({ ...form, images: [...form.images, imageUrl.trim()] })
    setImageUrl('')
  }

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const payload = {
      ...form,
      price: Number(form.price),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      areaSqft: Number(form.areaSqft) || 0,
      amenities: form.amenities.split(',').map((a) => a.trim()).filter(Boolean),
    }
    const body = new FormData()
    body.append('data', JSON.stringify(payload))
    files.forEach((f) => body.append('images', f))

    try {
      if (editing) await api.put(`/properties/${id}`, body)
      else await api.post('/properties', body)
      navigate('/admin/listings')
    } catch (err) {
      setError(errorMessage(err))
      setSaving(false)
    }
  }

  if (loading) return <Loader />

  return (
    <form className="card form property-form" onSubmit={submit}>
      <h1 className="h2">{editing ? 'Edit listing' : 'Add a new listing'}</h1>

      <fieldset>
        <legend>Basic details</legend>
        <label>Title<input name="title" value={form.title} onChange={update} required maxLength={120} placeholder="e.g. 3 BHK Apartment near Metro" /></label>
        <label>Description<textarea name="description" rows={5} value={form.description} onChange={update} required maxLength={3000} /></label>
        <div className="row-3">
          <label>
            Listed for
            <select name="listingType" value={form.listingType} onChange={update}>
              <option value="Sale">Sale</option>
              <option value="Rent">Rent</option>
            </select>
          </label>
          <label>
            Property type
            <select name="propertyType" value={form.propertyType} onChange={update}>
              {['Apartment', 'House', 'Villa', 'Plot', 'Commercial', 'PG'].map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <label>
            Availability
            <select name="availability" value={form.availability} onChange={update}>
              {['Available', 'Under Offer', 'Sold', 'Rented'].map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
        </div>
        <label>
          Price (₹){form.listingType === 'Rent' && ' per month'}
          <input type="number" name="price" min="0" value={form.price} onChange={update} required />
        </label>
      </fieldset>

      <fieldset>
        <legend>Location</legend>
        <label>Address<input name="address" value={form.location.address} onChange={updateLoc} placeholder="Building / house no." /></label>
        <div className="row-3">
          <label>Locality<input name="locality" value={form.location.locality} onChange={updateLoc} required /></label>
          <label>City<input name="city" value={form.location.city} onChange={updateLoc} required /></label>
          <label>Pincode<input name="pincode" value={form.location.pincode} onChange={updateLoc} pattern="\d{6}" title="6-digit pincode" /></label>
        </div>
      </fieldset>

      <fieldset>
        <legend>Features</legend>
        <div className="row-3">
          <label>Bedrooms<input type="number" min="0" name="bedrooms" value={form.bedrooms} onChange={update} /></label>
          <label>Bathrooms<input type="number" min="0" name="bathrooms" value={form.bathrooms} onChange={update} /></label>
          <label>Area (sq.ft)<input type="number" min="0" name="areaSqft" value={form.areaSqft} onChange={update} /></label>
        </div>
        <label>
          Furnishing
          <select name="furnishing" value={form.furnishing} onChange={update}>
            {['Unfurnished', 'Semi-Furnished', 'Fully Furnished'].map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
        <label>Amenities (comma separated)<input name="amenities" value={form.amenities} onChange={update} placeholder="Lift, Parking, Power Backup" /></label>
        <label className="checkbox"><input type="checkbox" name="featured" checked={form.featured} onChange={update} /> Show as featured on the home page</label>
      </fieldset>

      <fieldset>
        <legend>Images</legend>
        <div className="image-list">
          {form.images.map((src) => (
            <div key={src} className="image-item">
              <img src={src} alt="" />
              <button type="button" onClick={() => setForm({ ...form, images: form.images.filter((i) => i !== src) })} aria-label="Remove image">×</button>
            </div>
          ))}
          {files.map((f, i) => (
            <div key={f.name + i} className="image-item new">
              <img src={previews[i]} alt="" />
              <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} aria-label="Remove image">×</button>
            </div>
          ))}
        </div>
        <label>Upload photos (JPG, PNG, WEBP – max 5 MB each)<input type="file" accept="image/*" multiple onChange={addFiles} /></label>
        <div className="row-url">
          <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="…or paste an image URL" aria-label="Image URL" />
          <button type="button" className="btn btn-outline" onClick={addImageUrl}>Add URL</button>
        </div>
      </fieldset>

      {error && <p className="alert alert-error">{error}</p>}
      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={() => navigate('/admin/listings')}>Cancel</button>
        <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Publish listing'}</button>
      </div>
    </form>
  )
}

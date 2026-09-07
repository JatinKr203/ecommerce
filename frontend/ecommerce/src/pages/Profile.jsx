import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/common/Button'
import FormField from '../components/common/FormField'
import { useAuth } from '../context/useAuth'

function Profile() {
  const navigate = useNavigate()
  const { user, updateProfile, logout } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async (event) => {
    event.preventDefault()
    if (!name.trim()) {
      setError('Name is required')
      return
    }
    setSaving(true)
    setSaved(false)
    setError('')
    try {
      await updateProfile({ name: name.trim() })
      setSaved(true)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  return <div className="page-width account-page"><div className="profile-header"><div className="profile-avatar">{user?.name?.slice(0, 2).toUpperCase()}</div><div><span className="eyebrow">Your account</span><h1>{user?.name}</h1><p>{user?.email} · {user?.role === 'admin' ? 'Admin account' : 'Kitchenly member'}</p></div></div><div className="profile-layout"><aside className="account-nav"><Link className="active" to="/profile">Personal information</Link><Link to="/orders">Order history</Link><Link to="/cart">Saved items</Link><button type="button" onClick={handleLogout}>Log out</button></aside><section className="profile-form"><div className="section-heading"><div><span className="eyebrow">Your details</span><h2>Personal information</h2></div>{saved && <span className="saved-note">Changes saved</span>}</div>{error && <div className="form-error-banner" role="alert">{error}</div>}<form onSubmit={handleSave}><FormField label="Full name" value={name} onChange={(event) => { setName(event.target.value); setSaved(false) }} /><FormField label="Email address" type="email" value={user?.email || ''} readOnly /><p className="profile-note">Your email is managed by your account and cannot be changed here.</p><Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</Button></form></section></div></div>
}

export default Profile
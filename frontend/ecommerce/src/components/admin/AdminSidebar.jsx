import { NavLink } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'

function AdminSidebar() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const handleLogout = () => { logout(); navigate('/') }
  return <aside className="admin-sidebar"><div className="admin-side-brand"><span className="brand-mark">K</span><div><b>Kitchenly</b><small>Admin studio</small></div></div><span className="admin-nav-label">Workspace</span><nav><NavLink end to="/admin"><span>◫</span>Overview</NavLink><NavLink to="/admin/products"><span>▦</span>Products</NavLink><NavLink to="/admin/categories"><span>◒</span>Categories</NavLink><NavLink to="/admin/orders"><span>◌</span>Orders</NavLink></nav><div className="admin-side-bottom"><span className="admin-nav-label">Account</span><NavLink to="/profile"><span>◎</span>View storefront</NavLink><button type="button" onClick={handleLogout}><span>↪</span>Sign out</button></div></aside>
}

export default AdminSidebar
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import AdminSidebar from '../components/admin/AdminSidebar'
import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'
import FormField from '../components/common/FormField'
import LoadingState from '../components/common/LoadingState'
import Modal from '../components/common/Modal'
import { adminOrdersApi, categoriesApi, productsApi } from '../services/api'
import { normalizeProducts } from '../services/productService'
import { useAuth } from '../context/useAuth'

function AdminShell({ children, title, description, action }) {
  const { user } = useAuth()
  return <div className="admin-page"><AdminSidebar /><main className="admin-main"><header className="admin-header"><div><span className="eyebrow">Kitchenly admin studio</span><h1>{title}</h1><p>{description}</p></div><div className="admin-header-actions"><button className="icon-button" type="button" aria-label="Notifications">♢</button>{action}<div className="admin-avatar">{user?.name?.slice(0, 2).toUpperCase() || 'AD'}</div></div></header>{children}</main></div>
}

function AdminState({ status, error, retry, children }) {
  if (status === 'loading') return <LoadingState />
  if (status === 'error') return <div className="inline-error"><p>{error}</p><Button variant="outline" onClick={retry}>Try again</Button></div>
  return children
}

async function loadCatalog() {
  const [{ data: categoryData }, productResponse] = await Promise.all([categoriesApi.list(), productsApi.list({ limit: 100, sort: '-createdAt' })])
  const categoryOptions = (categoryData.categories || []).map((category) => ({ id: category._id, name: category.name, slug: category.slug }))
  const categoryMap = Object.fromEntries(categoryOptions.map((category) => [category.id, category.name]))
  return { categories: categoryOptions, products: normalizeProducts(productResponse.data.items, categoryMap), total: productResponse.data.total }
}

function Dashboard() {
  const [data, setData] = useState({ products: [], orders: [], categories: [] })
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const load = useCallback(async () => { try { const [catalog, orderResponse] = await Promise.all([loadCatalog(), adminOrdersApi.list()]); setData({ ...catalog, orders: orderResponse.data.orders || [] }); setStatus('success') } catch (requestError) { setError(requestError.message); setStatus('error') } }, [])
  useEffect(() => { const timer = window.setTimeout(load, 0); return () => window.clearTimeout(timer) }, [load])
  const revenue = data.orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
  return <AdminShell title="Store overview" description="Live catalog and order information from the backend."><AdminState status={status} error={error} retry={() => { setStatus('loading'); load() }}><div className="stats-grid">{[{ label: 'Total products', value: data.total, icon: '▦' }, { label: 'Total orders', value: data.orders.length, icon: '◫' }, { label: 'Total users', value: 'Unavailable', icon: '◎' }, { label: 'Order value', value: `₹${revenue}`, icon: '₹' }].map((stat) => <div className="stat-card" key={stat.label}><div className="stat-card-top"><span>{stat.icon}</span><small>Live</small></div><strong>{stat.value}</strong><p>{stat.label}</p></div>)}</div><div className="admin-dashboard-grid lower"><section className="admin-panel"><div className="panel-heading"><div><span className="eyebrow">Latest activity</span><h2>Recent orders</h2></div><Link className="text-link" to="/admin/orders">View all →</Link></div><OrderTable rows={data.orders.slice(0, 5)} /></section><section className="admin-panel"><div className="panel-heading"><div><span className="eyebrow">Inventory watch</span><h2>Low stock</h2></div><Link className="text-link" to="/admin/products">Manage →</Link></div><div className="low-stock-list">{data.products.filter((product) => product.stock < 15).slice(0, 5).map((product) => <div key={product.id}><img src={product.image} alt="" /><span>{product.name}<small>{product.stock} units left</small></span><b className="stock low">Restock</b></div>)}</div></section></div></AdminState></AdminShell>
}

function OrderTable({ rows }) { return <div className="table-wrap"><table><thead><tr><th>Order</th><th>Date</th><th>Status</th><th>Total</th></tr></thead><tbody>{rows.map((order) => <tr key={order._id}><td><b>{order._id}</b></td><td>{new Date(order.createdAt).toLocaleDateString('en-IN')}</td><td><span className={`status status-${order.status}`}>{order.status}</span></td><td><b>₹{order.totalAmount}</b></td></tr>)}</tbody></table></div> }

const emptyProduct = { name: '', price: '', discountPrice: '', stock: '', sku: '', category: '', description: '' }

function ProductsAdmin() {
  const [catalog, setCatalog] = useState({ products: [], categories: [], total: 0 })
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyProduct)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const load = useCallback(async () => { try { setCatalog(await loadCatalog()); setStatus('success') } catch (requestError) { setError(requestError.message); setStatus('error') } }, [])
  useEffect(() => { const timer = window.setTimeout(load, 0); return () => window.clearTimeout(timer) }, [load])
  const filtered = useMemo(() => catalog.products.filter((product) => product.name.toLowerCase().includes(search.toLowerCase())), [catalog.products, search])
  const openForm = (product = null) => { setEditing(product); setForm(product ? { name: product.name, price: product.originalPrice, discountPrice: product.discountPrice || '', stock: product.stock, sku: product.sku, category: typeof product.category === 'string' ? catalog.categories.find((category) => category.name === product.category)?.id || '' : '', description: product.description || '' } : { ...emptyProduct, category: catalog.categories[0]?.id || '' }); setActionError(''); setModalOpen(true) }
  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  const saveProduct = async (event) => { event.preventDefault(); setActionError(''); const payload = { name: form.name, price: Number(form.price), discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined, stock: Number(form.stock), sku: form.sku, category: form.category, description: form.description }; try { if (editing) await productsApi.update(editing.id, payload); else await productsApi.create(payload); setModalOpen(false); await load() } catch (requestError) { setActionError(requestError.message) } }
  const deleteProduct = async (product) => { if (!window.confirm(`Deactivate ${product.name}?`)) return; try { await productsApi.remove(product.id); await load() } catch (requestError) { setActionError(requestError.message) } }
  return <AdminShell title="Products" description="Manage live catalog records and inventory." action={<Button onClick={() => openForm()}>+ Add product</Button>}><AdminState status={status} error={error} retry={() => { setStatus('loading'); load() }}><div className="admin-toolbar"><label className="search-field"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products" /></label><span className="toolbar-count">{filtered.length} of {catalog.total} products</span></div>{actionError && <div className="form-error-banner" role="alert">{actionError}</div>}<section className="admin-panel table-panel"><div className="table-wrap"><table><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th /></tr></thead><tbody>{filtered.map((product) => <tr key={product.id}><td><div className="table-product"><img src={product.image} alt="" /><b>{product.name}</b></div></td><td>{product.category}</td><td>₹{product.price}</td><td>{product.stock}</td><td><span className={product.stock < 6 ? 'status status-low-stock' : 'status status-active'}>{product.stock < 6 ? 'Low stock' : 'Active'}</span></td><td><div className="table-actions"><button type="button" onClick={() => openForm(product)}>Edit</button><button type="button" onClick={() => deleteProduct(product)}>Deactivate</button></div></td></tr>)}</tbody></table></div>{!filtered.length && <EmptyState title="No products found" />}</section></AdminState>{modalOpen && <Modal title={editing ? 'Edit product' : 'Add a product'} onClose={() => setModalOpen(false)}><form className="modal-form" onSubmit={saveProduct}><FormField label="Product name" value={form.name} onChange={updateField('name')} required /><div className="form-grid"><FormField label="Original price" type="number" value={form.price} onChange={updateField('price')} required /><FormField label="Discount price" type="number" value={form.discountPrice} onChange={updateField('discountPrice')} /></div><div className="form-grid"><FormField label="Stock" type="number" value={form.stock} onChange={updateField('stock')} required /><FormField label="SKU" value={form.sku} onChange={updateField('sku')} required /></div><label className="form-field"><span>Category</span><select value={form.category} onChange={updateField('category')} required><option value="">Choose category</option>{catalog.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><FormField label="Description" value={form.description} onChange={updateField('description')} />{actionError && <div className="form-error-banner">{actionError}</div>}<div className="modal-actions"><Button variant="text" onClick={() => setModalOpen(false)}>Cancel</Button><Button type="submit">Save product</Button></div></form></Modal>}</AdminShell>
}

function CategoriesAdmin() {
  const [categories, setCategories] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [name, setName] = useState('')
  const [actionError, setActionError] = useState('')
  const load = useCallback(async () => { try { const { data } = await categoriesApi.list(); setCategories(data.categories || []); setStatus('success') } catch (requestError) { setError(requestError.message); setStatus('error') } }, [])
  useEffect(() => { const timer = window.setTimeout(load, 0); return () => window.clearTimeout(timer) }, [load])
  const openForm = (category = null) => { setEditing(category); setName(category?.name || ''); setActionError(''); setFormOpen(true) }
  const saveCategory = async (event) => { event.preventDefault(); setActionError(''); const payload = { name: name.trim(), slug: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }; try { if (editing) await categoriesApi.update(editing._id, payload); else await categoriesApi.create(payload); setFormOpen(false); await load() } catch (requestError) { setActionError(requestError.message) } }
  const deleteCategory = async (category) => { if (!window.confirm(`Deactivate ${category.name}?`)) return; try { await categoriesApi.remove(category._id); await load() } catch (requestError) { setActionError(requestError.message) } }
  return <AdminShell title="Categories" description="Manage the live catalog categories." action={<Button onClick={() => openForm()}>+ Add category</Button>}><AdminState status={status} error={error} retry={() => { setStatus('loading'); load() }}>{actionError && <div className="form-error-banner">{actionError}</div>}<div className="category-admin-grid">{categories.map((category) => <div className="category-admin-card" key={category._id}><div><span className="category-admin-icon">◒</span><h3>{category.name}</h3><p>Live category</p></div><div className="table-actions"><button type="button" onClick={() => openForm(category)}>Edit</button><button type="button" onClick={() => deleteCategory(category)}>Deactivate</button></div></div>)}</div>{!categories.length && <EmptyState title="No categories found" />}</AdminState>{formOpen && <Modal title={editing ? 'Edit category' : 'Add category'} onClose={() => setFormOpen(false)}><form className="modal-form" onSubmit={saveCategory}><FormField label="Category name" value={name} onChange={(event) => setName(event.target.value)} required />{actionError && <div className="form-error-banner">{actionError}</div>}<div className="modal-actions"><Button variant="text" onClick={() => setFormOpen(false)}>Cancel</Button><Button type="submit">Save category</Button></div></form></Modal>}</AdminShell>
}

function OrdersAdmin() {
  const [orders, setOrders] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const load = useCallback(async () => { try { const { data } = await adminOrdersApi.list(); setOrders(data.orders || []); setStatus('success') } catch (requestError) { setError(requestError.message); setStatus('error') } }, [])
  useEffect(() => { const timer = window.setTimeout(load, 0); return () => window.clearTimeout(timer) }, [load])
  const updateStatus = async (order, nextStatus) => { try { await adminOrdersApi.updateStatus(order._id, nextStatus); await load() } catch (requestError) { setError(requestError.message); setStatus('error') } }
  return <AdminShell title="Orders" description="Review and update live customer orders."><AdminState status={status} error={error} retry={() => { setStatus('loading'); load() }}>{orders.length ? <section className="admin-panel table-panel"><div className="table-wrap"><table><thead><tr><th>Order ID</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th><th /></tr></thead><tbody>{orders.map((order) => <tr key={order._id}><td><b>{order._id}</b></td><td>{order.user?.name || 'Unknown customer'}</td><td>{new Date(order.createdAt).toLocaleDateString('en-IN')}</td><td><b>₹{order.totalAmount}</b></td><td><select className="inline-select" value={order.status} onChange={(event) => updateStatus(order, event.target.value)} aria-label={`Update ${order._id}`}><option>pending</option><option>confirmed</option><option>shipped</option><option>delivered</option><option>cancelled</option></select></td><td><button className="view-button" type="button" onClick={() => setSelected(order)}>View →</button></td></tr>)}</tbody></table></div></section> : <EmptyState title="No orders found" />}</AdminState>{selected && <Modal title={`Order ${selected._id}`} onClose={() => setSelected(null)}><div className="order-detail"><div className="order-detail-status"><span className={`status status-${selected.status}`}>{selected.status}</span><b>₹{selected.totalAmount}</b></div><h3>{selected.user?.name || 'Customer order'}</h3><p>{selected.shippingAddress}</p><div className="summary-total"><span>Items</span><strong>{selected.items?.length || 0}</strong></div><Button className="full-button" onClick={() => setSelected(null)}>Close details</Button></div></Modal>}</AdminShell>
}

function Admin() {
  const location = useLocation()
  const content = useMemo(() => location.pathname.endsWith('/products') ? <ProductsAdmin /> : location.pathname.endsWith('/categories') ? <CategoriesAdmin /> : location.pathname.endsWith('/orders') ? <OrdersAdmin /> : <Dashboard />, [location.pathname])
  return content
}

export default Admin
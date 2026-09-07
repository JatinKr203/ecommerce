import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import Breadcrumb from '../components/common/Breadcrumb'
import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'
import LoadingState from '../components/common/LoadingState'
import ProductGallery from '../components/products/ProductGallery'
import ProductGrid from '../components/products/ProductGrid'
import { categoriesApi } from '../services/api'
import { useAuth } from '../context/useAuth'
import { useCart } from '../context/useCart'
import { listProducts, getProduct } from '../services/productService'

function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const { addToCart, actionId } = useCart()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [cartMessage, setCartMessage] = useState('')

  const loadProduct = useCallback(async () => {
    setError('')
    try {
      const result = await getProduct(id)
      setProduct(result.product)
      const { data: categoryData } = await categoriesApi.list()
      const categoryMap = Object.fromEntries((categoryData.categories || []).map((category) => [category._id, category.name]))
      const relatedResult = await listProducts({ limit: 100, sort: '-createdAt' }, categoryMap)
      setRelated(relatedResult.items.filter((item) => item.category === result.product.category && item.id !== result.product.id).slice(0, 4))
      setStatus('success')
    } catch (requestError) {
      setError(requestError.message)
      setStatus('error')
    }
  }, [id])

  useEffect(() => { const timer = window.setTimeout(loadProduct, 0); return () => window.clearTimeout(timer) }, [loadProduct])

  if (status === 'loading') return <div className="page-width details-page"><LoadingState /></div>
  if (status === 'error') return <div className="page-width details-page"><EmptyState title="Product unavailable" description={error || 'We could not load this product.'} /><div className="center-action"><Button variant="outline" onClick={() => { setStatus('loading'); loadProduct() }}>Try again</Button></div></div>
  if (!product) return <div className="page-width details-page"><EmptyState title="Product not found" /></div>

  const handleAddToCart = async () => {
    setCartMessage('')
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } })
      return
    }
    try {
      await addToCart(product, quantity)
      setCartMessage('Added to cart')
    } catch (requestError) {
      setCartMessage(requestError.message)
    }
  }

  return <div className="page-width details-page"><Breadcrumb current={product.name} /><div className="details-grid"><ProductGallery product={product} /><div className="details-copy"><span className="product-category">{product.category}</span><h1>{product.name}</h1><div className="details-rating"><span>★★★★★</span> <b>{product.rating}</b> <a href="#reviews">{product.reviews} reviews</a></div><div className="details-price"><strong>₹{product.price}</strong>{product.discountPercentage > 0 && <del>₹{product.oldPrice}</del>}{product.discountPercentage > 0 && <span>{product.discountPercentage}% off</span>}</div><p className="details-description">{product.description}</p><div className="stock-line"><span className="stock-dot" /> {product.stock < 6 ? `Only ${product.stock} left in stock` : `${product.stock} in stock and ready to ship`}</div><div className="quantity-row"><div className="quantity-control"><button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button><span>{quantity}</span><button type="button" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>+</button></div><Button className="grow-button" onClick={handleAddToCart} disabled={actionId === product.id}>{actionId === product.id ? 'Adding...' : 'Add to cart'}</Button><Button variant="outline">Buy now</Button></div>{cartMessage && <p className={cartMessage === 'Added to cart' ? 'cart-success' : 'cart-error'}>{cartMessage}</p>}<div className="detail-benefits"><div><b>{product.freeDelivery ? 'Free delivery' : 'Delivery available'}</b><span>See checkout for options</span></div><div><b>{product.returnDays}-day returns</b><span>Easy returns</span></div><div><b>{product.cashOnDelivery ? 'Cash on delivery' : 'Secure checkout'}</b><span>Your data is protected</span></div></div><div className="spec-list"><div><span>Brand</span><b>{product.brand || '—'}</b></div><div><span>Material</span><b>{product.material || '—'}</b></div><div><span>Capacity</span><b>{product.capacity || '—'}</b></div><div><span>Weight</span><b>{product.weight || '—'}</b></div><div><span>Warranty</span><b>{product.warranty || '—'}</b></div></div></div></div><section className="related-products"><div className="section-heading"><div><span className="eyebrow">You may also like</span><h2>Made to work together</h2></div><Link className="text-link" to="/products">Shop all →</Link></div>{related.length ? <ProductGrid products={related} /> : <EmptyState title="No related products yet" />}</section></div>
}

export default ProductDetails
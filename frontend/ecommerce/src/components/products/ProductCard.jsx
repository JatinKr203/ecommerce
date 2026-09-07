import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Button from '../common/Button'
import { getFallbackImage } from '../../utils/imageUrl'
import { useAuth } from '../../context/useAuth'
import { useCart } from '../../context/useCart'

function ProductCard({ product, onAdd }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const { addToCart, actionId } = useCart()
  const [message, setMessage] = useState('')
  const adding = actionId === product.id

  const handleAdd = async () => {
    setMessage('')
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } })
      return
    }
    try {
      if (onAdd) await onAdd(product)
      else await addToCart(product)
      setMessage('Added to cart')
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <article className="product-card">
      <Link className="product-image-wrap" to={`/products/${product.id}`}>
        {product.badge && <span className="product-badge">{product.badge}</span>}
        <img className="product-image" src={product.image} alt={product.name} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = getFallbackImage(product) }} />
      </Link>
      <div className="product-card-body">
        <span className="product-category">{product.category}</span>
        <Link className="product-name" to={`/products/${product.id}`}>{product.name}</Link>
        <div className="rating"><span>★</span> {product.rating} <small>({product.reviews})</small></div>
        <div className="product-card-bottom"><div><strong>₹{product.price}</strong>{product.discountPercentage > 0 && <del>₹{product.oldPrice}</del>}</div><span className={product.stock < 6 ? 'stock low' : 'stock'}>{product.stock < 6 ? 'Low stock' : `${product.stock} in stock`}</span></div>
        <Button variant="outline" className="full-button" onClick={handleAdd} disabled={adding}>{adding ? 'Adding...' : 'Add to cart'}</Button>
        {message && <small className={message === 'Added to cart' ? 'cart-success' : 'cart-error'}>{message}</small>}
      </div>
    </article>
  )
}

export default ProductCard
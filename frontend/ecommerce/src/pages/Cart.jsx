import { useState } from 'react'
import { Link } from 'react-router-dom'
import Breadcrumb from '../components/common/Breadcrumb'
import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'
import LoadingState from '../components/common/LoadingState'
import { getFallbackImage } from '../utils/imageUrl'
import { useCart } from '../context/useCart'

function Cart() {
  const { items, subtotal, loading, actionId, error, updateQuantity, removeFromCart, clearError } = useCart()
  const [actionError, setActionError] = useState('')

  const handleUpdate = async (product, quantity) => {
    setActionError('')
    try {
      await updateQuantity(product, quantity)
    } catch (requestError) {
      setActionError(requestError.message)
    }
  }

  const handleRemove = async (productId) => {
    setActionError('')
    try {
      await removeFromCart(productId)
    } catch (requestError) {
      setActionError(requestError.message)
    }
  }

  return <div className="page-width cart-page"><Breadcrumb current="Your cart" /><div className="page-title-row"><div><span className="eyebrow">Saved for dinner</span><h1>Your cart <span>({items.length})</span></h1></div><Link className="text-link" to="/products">Continue shopping →</Link></div>{(error || actionError) && <div className="form-error-banner" role="alert">{error || actionError}<button className="dismiss-error" type="button" onClick={() => { clearError(); setActionError('') }}>×</button></div>}{loading ? <LoadingState /> : items.length ? <div className="cart-layout"><div className="cart-items"><div className="cart-label-row"><span>Product</span><span>Quantity</span><span>Total</span></div>{items.map(({ product, quantity }) => <div className="cart-item" key={product.id}><img src={product.image} alt={product.name} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = getFallbackImage(product) }} /><div className="cart-item-info"><span className="product-category">{product.category}</span><Link to={`/products/${product.id}`}>{product.name}</Link><span>₹{product.originalPrice} each</span><div className="cart-item-actions"><button type="button">♡ Save for later</button><button type="button" onClick={() => handleRemove(product.id)} disabled={actionId === product.id}>Remove</button></div></div><div className="quantity-control"><button type="button" onClick={() => handleUpdate(product, quantity - 1)} disabled={quantity <= 1 || actionId === product.id}>−</button><span>{quantity}</span><button type="button" onClick={() => handleUpdate(product, quantity + 1)} disabled={quantity >= product.stock || actionId === product.id}>+</button></div><strong>₹{product.originalPrice * quantity}</strong></div>)}</div><aside className="summary-card"><h2>Order summary</h2><div><span>Subtotal</span><b>₹{subtotal}</b></div><div><span>Delivery</span><b className="free">Calculated at checkout</b></div><div className="summary-total"><span>Total</span><strong>₹{subtotal}</strong></div><Button to="/checkout" className="full-button">Proceed to checkout →</Button><small className="secure-note">▣ Secure order placement · Stock checked live</small></aside></div> : <EmptyState title="Your cart is waiting" description="Add something beautiful to your kitchen and it will appear here." />}</div>
}

export default Cart
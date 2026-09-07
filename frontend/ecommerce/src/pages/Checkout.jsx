import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'
import FormField from '../components/common/FormField'
import LoadingState from '../components/common/LoadingState'
import { ordersApi } from '../services/api'
import { useAuth } from '../context/useAuth'
import { useCart } from '../context/useCart'

const initialValues = { name: '', address: '', city: '', state: '', postalCode: '', country: 'India' }

function Checkout() {
  const { user } = useAuth()
  const { items, subtotal, loading: cartLoading, refreshCart } = useCart()
  const [values, setValues] = useState({ ...initialValues, name: user?.name || '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [order, setOrder] = useState(null)

  const updateValue = (field) => (event) => setValues((current) => ({ ...current, [field]: event.target.value }))
  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    const requiredFields = ['name', 'address', 'city', 'state', 'postalCode', 'country']
    if (requiredFields.some((field) => !values[field].trim())) {
      setError('Complete all shipping fields before placing the order.')
      return
    }
    setSubmitting(true)
    try {
      const shippingAddress = `${values.name}, ${values.address}, ${values.city}, ${values.state} ${values.postalCode}, ${values.country}`
      const { data } = await ordersApi.create({ shippingAddress })
      setOrder(data.order)
      await refreshCart()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (cartLoading) return <div className="page-width checkout-page"><LoadingState /></div>
  if (!items.length && !order) return <div className="page-width checkout-page"><EmptyState title="Your cart is empty" description="Add a product before starting checkout." /><div className="center-action"><Button to="/products">Shop products</Button></div></div>
  if (order) return <div className="success-page page-width"><span className="success-icon">✓</span><span className="eyebrow">Order received</span><h1>Thank you for your order.</h1><p>Your order <strong>{order._id}</strong> has been placed. No online payment was processed; Kitchenly has recorded the order for fulfillment.</p><Button to={`/orders/${order._id}`}>View order details</Button></div>

  return <div className="page-width checkout-page"><div className="checkout-progress"><span className="done">1 Cart</span><span className="active">2 Shipping & order</span><span>3 Confirmation</span></div><div className="checkout-layout"><form className="checkout-form" onSubmit={handleSubmit}><div className="checkout-section"><div className="checkout-section-title"><span>01</span><div><h2>Contact information</h2><p>Order updates will be associated with {user?.email}.</p></div></div><FormField label="Email address" type="email" value={user?.email || ''} readOnly /></div><div className="checkout-section"><div className="checkout-section-title"><span>02</span><div><h2>Shipping address</h2><p>The backend stores this as one shipping address.</p></div></div><FormField label="Full name" value={values.name} onChange={updateValue('name')} placeholder="Your full name" required /><FormField label="Address" value={values.address} onChange={updateValue('address')} placeholder="Street and house number" required /><div className="form-grid three"><FormField label="City" value={values.city} onChange={updateValue('city')} placeholder="City" required /><FormField label="State" value={values.state} onChange={updateValue('state')} placeholder="State" required /><FormField label="Postal code" value={values.postalCode} onChange={updateValue('postalCode')} placeholder="Postal code" required /></div><FormField label="Country" value={values.country} onChange={updateValue('country')} placeholder="Country" required /></div><div className="checkout-section"><div className="checkout-section-title"><span>03</span><div><h2>Order placement</h2><p>Online payment is not implemented by the backend.</p></div></div><div className="choice-field selected"><span><b>Place order for fulfillment</b><small>Payment and delivery arrangements will be handled separately.</small></span><strong>₹{subtotal}</strong></div></div>{error && <div className="form-error-banner" role="alert">{error}</div>}<Button type="submit" className="full-button" disabled={submitting}>{submitting ? 'Placing order...' : `Place order · ₹${subtotal}`}</Button></form><aside className="summary-card checkout-summary"><h2>Your order</h2>{items.map(({ product, quantity }) => <div className="mini-cart-item" key={product.id}><img src={product.image} alt="" /><span>{product.name}<small>Qty {quantity}</small></span><b>₹{product.originalPrice * quantity}</b></div>)}<div className="summary-total"><span>Total</span><strong>₹{subtotal}</strong></div><div className="checkout-trust">▣ Your cart remains unchanged if order placement fails.</div><Link className="back-link" to="/cart">← Return to cart</Link></aside></div></div>
}

export default Checkout
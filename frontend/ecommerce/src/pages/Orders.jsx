import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Breadcrumb from '../components/common/Breadcrumb'
import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'
import LoadingState from '../components/common/LoadingState'
import { ordersApi } from '../services/api'

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : 'Date unavailable'
}

function Orders() {
  const [orders, setOrders] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const loadOrders = useCallback(async () => {
    setError('')
    try {
      const { data } = await ordersApi.list()
      setOrders(data.orders || [])
      setStatus('success')
    } catch (requestError) {
      setError(requestError.message)
      setStatus('error')
    }
  }, [])

  useEffect(() => { const timer = window.setTimeout(loadOrders, 0); return () => window.clearTimeout(timer) }, [loadOrders])

  return <div className="page-width account-page"><Breadcrumb current="My orders" /><div className="page-title-row"><div><span className="eyebrow">Your kitchen history</span><h1>My orders</h1></div><Button to="/products">Shop again</Button></div>{status === 'loading' ? <LoadingState /> : status === 'error' ? <div className="inline-error"><p>{error}</p><Button variant="outline" onClick={() => { setStatus('loading'); loadOrders() }}>Try again</Button></div> : orders.length ? <div className="orders-list">{orders.map((order) => <article className="order-card" key={order._id}><div className="order-card-top"><div><span className="product-category">{order._id}</span><h3>{formatDate(order.createdAt)}</h3></div><span className={`status status-${order.status}`}>{order.status}</span></div><div className="order-card-bottom"><span>{order.items?.length || 0} items</span><strong>₹{order.totalAmount}</strong><Button to={`/orders/${order._id}`} variant="outline">View order</Button></div></article>)}</div> : <EmptyState title="No orders yet" description="Your completed orders will appear here." />}<div className="account-help"><span>Need a hand?</span><Link to="/profile">Visit your profile or contact support →</Link></div></div>
}

export function OrderDetails() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const loadOrder = useCallback(async () => {
    try {
      const { data } = await ordersApi.getById(id)
      setOrder(data.order)
      setStatus('success')
    } catch (requestError) {
      setError(requestError.message)
      setStatus('error')
    }
  }, [id])

  useEffect(() => { const timer = window.setTimeout(loadOrder, 0); return () => window.clearTimeout(timer) }, [loadOrder])
  if (status === 'loading') return <div className="page-width account-page"><LoadingState /></div>
  if (status === 'error') return <div className="page-width account-page"><EmptyState title="Order unavailable" description={error} /><div className="center-action"><Button to="/orders">Back to orders</Button></div></div>
  return <div className="page-width account-page"><Breadcrumb current="Order details" /><div className="page-title-row"><div><span className="eyebrow">Order details</span><h1>Order {order._id}</h1></div><span className={`status status-${order.status}`}>{order.status}</span></div><div className="order-detail-panel"><div><span className="product-category">Placed {formatDate(order.createdAt)}</span><h2>Shipping address</h2><p>{order.shippingAddress}</p></div><div className="order-detail-items">{order.items.map((item) => <div className="mini-cart-item" key={`${item.product}-${item.name}`}><span>{item.name}<small>Qty {item.quantity} · ₹{item.price} each</small></span><b>₹{item.price * item.quantity}</b></div>)}</div><div className="summary-total"><span>Total</span><strong>₹{order.totalAmount}</strong></div></div><Button to="/orders" variant="outline">← Back to orders</Button></div>
}

export default Orders
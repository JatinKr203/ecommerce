import { useCallback, useEffect, useMemo, useState } from 'react'
import { cartApi, categoriesApi } from '../services/api'
import { normalizeProduct } from '../services/productService'
import { useAuth } from './useAuth'
import CartContext from './cart-context-value'

function normalizeCart(cart, subtotal = 0) {
  const items = (cart?.items || []).map((item) => ({
    product: normalizeProduct(item.product),
    quantity: item.quantity,
  })).filter((item) => item.product)
  return { items, subtotal }
}

function CartProvider({ children }) {
  const { user, initializing } = useAuth()
  const [cart, setCart] = useState({ items: [], subtotal: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [actionId, setActionId] = useState(null)

  const loadCart = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError('')
    try {
      const [{ data }, { data: categoryData }] = await Promise.all([cartApi.get(), categoriesApi.list()])
      const categoryMap = Object.fromEntries((categoryData.categories || []).map((category) => [category._id, category.name]))
      const mappedCart = {
        ...data.cart,
        items: (data.cart?.items || []).map((item) => ({ ...item, product: { ...item.product, category: categoryMap[item.product?.category] || item.product?.category } })),
      }
      setCart(normalizeCart(mappedCart, data.subtotal))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (initializing) return undefined
    const timer = window.setTimeout(() => {
      if (user) loadCart()
      else setCart({ items: [], subtotal: 0 })
    }, 0)
    return () => window.clearTimeout(timer)
  }, [initializing, loadCart, user])

  const runCartAction = useCallback(async (productId, action) => {
    setActionId(productId)
    setError('')
    try {
      await action()
      await loadCart()
    } catch (requestError) {
      setError(requestError.message)
      throw requestError
    } finally {
      setActionId(null)
    }
  }, [loadCart])

  const value = useMemo(() => ({
    ...cart,
    count: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    loading,
    actionId,
    error,
    clearError: () => setError(''),
    refreshCart: loadCart,
    async addToCart(product, quantity = 1) {
      if (!user) throw new Error('Please sign in to add items to your cart')
      const current = cart.items.find((item) => item.product.id === product.id)
      const nextQuantity = (current?.quantity || 0) + quantity
      if (nextQuantity > product.stock) throw new Error(`Only ${product.stock} units are available`)
      return runCartAction(product.id, () => cartApi.add(product.id, quantity))
    },
    async updateQuantity(product, quantity) {
      if (quantity < 1 || quantity > product.stock) throw new Error(`Choose a quantity between 1 and ${product.stock}`)
      return runCartAction(product.id, () => cartApi.update(product.id, quantity))
    },
    async removeFromCart(productId) {
      return runCartAction(productId, () => cartApi.remove(productId))
    },
  }), [actionId, cart, error, loading, loadCart, runCartAction, user])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export default CartProvider
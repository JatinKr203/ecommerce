import { Route, Routes } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import Admin from '../pages/Admin'
import Cart from '../pages/Cart'
import Checkout from '../pages/Checkout'
import Home from '../pages/Home'
import { Login, Register } from '../pages/AuthPages'
import Orders, { OrderDetails } from '../pages/Orders'
import ProductDetails from '../pages/ProductDetails'
import Products from '../pages/Products'
import Profile from '../pages/Profile'
import ProtectedRoute from './ProtectedRoute'
import AdminRoute from './AdminRoute'

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/cart" element={<Cart />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route element={<AdminRoute />}>
          <Route path="/admin/*" element={<Admin />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default AppRoutes
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'
import LoadingState from '../components/common/LoadingState'
import SectionTitle from '../components/common/SectionTitle'
import ProductGrid from '../components/products/ProductGrid'
import { categoriesApi } from '../services/api'
import { listProducts } from '../services/productService'
import { getProductImage } from '../utils/imageUrl'

function Home() {
  const [products, setProducts] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  const loadProducts = useCallback(async () => {
    setError('')
    try {
      const [{ data: categoryData }, result] = await Promise.all([
        categoriesApi.list(),
        listProducts({ limit: 100, sort: '-createdAt' }),
      ])
      const categoryMap = Object.fromEntries((categoryData.categories || []).map((category) => [category._id, category.name]))
      const mappedProducts = result.items.map((product) => ({ ...product, category: categoryMap[product.category] || product.category }))
      setProducts(mappedProducts)
      setStatus('success')
    } catch (requestError) {
      setError(requestError.message)
      setStatus('error')
    }
  }, [])

  useEffect(() => { const timer = window.setTimeout(loadProducts, 0); return () => window.clearTimeout(timer) }, [loadProducts])

  const categories = useMemo(() => [...new Set(products.map((product) => product.category).filter(Boolean))].slice(0, 6).map((name) => {
    const product = products.find((item) => item.category === name)
    return { name, image: getProductImage(product), description: product?.subcategory || 'Kitchen essentials for every day' }
  }), [products])
  const featured = products.filter((product) => product.isFeatured).slice(0, 4)
  const bestSellers = products.filter((product) => product.isBestSeller).slice(0, 4)
  const newArrivals = products.filter((product) => product.isNewArrival).slice(0, 4)
  const featuredProducts = featured.length ? featured : products.slice(0, 4)
  const bestSellerProducts = bestSellers.length ? bestSellers : products.slice(4, 8)

  return <div className="home-page">
    <section className="hero-section page-width"><div className="hero-copy"><span className="eyebrow">The everyday collection</span><h1>Tools for the way you <em>really</em> cook.</h1><p>Thoughtful kitchen essentials, chosen for the pleasure of making something from scratch.</p><div className="hero-actions"><Button to="/products">Shop the collection <span>→</span></Button><Button to="/products" variant="text">Explore categories <span>↗</span></Button></div><div className="hero-note"><span className="avatar-stack"><i>MC</i><i>JR</i><i>AR</i></span><span>Joined by 12,000+ home cooks</span></div></div><div className="hero-image"><img src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=85" alt="A bright kitchen counter ready for cooking" /><div className="hero-image-label"><span>01</span><b>Made for<br />good meals.</b></div></div></section>
    <section className="home-section page-width"><SectionTitle eyebrow="Shop by category" title="Everything your kitchen needs" action={<Link className="text-link" to="/products">View all products →</Link>} />{status === 'loading' ? <LoadingState /> : status === 'error' ? <div className="inline-error"><p>{error}</p><Button variant="outline" onClick={() => { setStatus('loading'); loadProducts() }}>Try again</Button></div> : categories.length ? <div className="category-grid">{categories.map((category) => <Link className="category-card" to={`/products?category=${encodeURIComponent(category.name)}`} key={category.name}><img src={category.image} alt="" /><div><span>✦</span><h3>{category.name}</h3><p>{category.description}</p></div></Link>)}</div> : <EmptyState title="Categories are not available" description="Products will appear here when the catalog is ready." />}</section>
    <section className="home-section home-section-tint"><div className="page-width"><SectionTitle eyebrow="Featured products" title="Objects worth cooking with" action={<Link className="text-link" to="/products">Shop all products →</Link>} />{status === 'loading' ? <LoadingState /> : featuredProducts.length ? <ProductGrid products={featuredProducts} /> : <EmptyState title="No featured products yet" />}</div></section>
    <section className="home-section page-width"><div className="split-promo"><div><span className="eyebrow">Best sellers</span><h2>Gather around<br /><em>something beautiful.</em></h2><p>Our best-selling essentials are made to be used, loved, and passed around.</p><Button to="/products">Shop best sellers</Button></div>{bestSellerProducts[0] ? <img src={getProductImage(bestSellerProducts[0])} alt={bestSellerProducts[0].name} /> : <div className="promo-image-placeholder" />}</div></section>
    <section className="home-section home-section-tint"><div className="page-width"><SectionTitle eyebrow="New arrivals" title="Fresh into the collection" action={<Link className="text-link" to="/products">Explore new arrivals →</Link>} />{status === 'loading' ? <LoadingState /> : newArrivals.length ? <ProductGrid products={newArrivals} /> : <EmptyState title="No new arrivals yet" description="Check back soon for the latest products." />}</div></section>
    <section className="home-section page-width"><SectionTitle eyebrow="Why Kitchenly" title="The good stuff, considered" /><div className="benefits-grid"><div><span className="benefit-icon">✦</span><h3>Quality products</h3><p>Materials and makers chosen to last beyond the trend cycle.</p></div><div><span className="benefit-icon">↗</span><h3>Fast delivery</h3><p>Free delivery on qualifying orders, always packed with care.</p></div><div><span className="benefit-icon">⌁</span><h3>Secure payment</h3><p>Simple, protected checkout with the payment methods you trust.</p></div><div><span className="benefit-icon">○</span><h3>Here to help</h3><p>Real people ready to answer your kitchen questions.</p></div></div></section>
    <section className="newsletter page-width"><div><span className="eyebrow">The Kitchenly letter</span><h2>A little inspiration,<br /><em>delivered.</em></h2></div><div><p>Seasonal recipes, considered tools, and notes from our favorite cooks.</p><form className="newsletter-form" onSubmit={(event) => event.preventDefault()}><input type="email" placeholder="Your email address" aria-label="Your email address" /><Button type="submit">Subscribe</Button></form><small>By subscribing, you agree to receive Kitchenly updates.</small></div></section>
  </div>
}

export default Home
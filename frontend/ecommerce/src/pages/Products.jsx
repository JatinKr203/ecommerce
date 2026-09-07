import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Breadcrumb from '../components/common/Breadcrumb'
import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'
import LoadingState from '../components/common/LoadingState'
import ProductFilters from '../components/products/ProductFilters'
import ProductGrid from '../components/products/ProductGrid'
import { categoriesApi } from '../services/api'
import { listProducts } from '../services/productService'

const sortValues = { featured: '-createdAt', 'price-low': 'price', 'price-high': '-price', rating: '-rating' }

function Products() {
  const [searchParams] = useSearchParams()
  const categoryParam = searchParams.get('category') || ''
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [categoryOptions, setCategoryOptions] = useState([])
  const [categoryMap, setCategoryMap] = useState({})
  const [sort, setSort] = useState('featured')
  const [priceRange, setPriceRange] = useState('all')
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    categoriesApi.list().then(({ data }) => {
      const options = (data.categories || []).map((item) => ({ id: item._id, name: item.name }))
      setCategoryOptions(options)
      setCategoryMap(Object.fromEntries(options.map((item) => [item.id, item.name])))
      if (categoryParam) {
        const matched = options.find((item) => item.name.toLowerCase() === categoryParam.toLowerCase())
        if (matched) setCategory(matched.id)
      }
    }).catch(() => setCategoryOptions([]))
  }, [categoryParam])

  const loadProducts = useCallback(async () => {
    setError('')
    const priceParts = priceRange === 'all' ? [] : priceRange.split('-')
    const params = {
      search: search || undefined,
      category: category === 'All' ? undefined : category,
      minPrice: priceParts[0] || undefined,
      maxPrice: priceParts[1] || undefined,
      sort: sortValues[sort],
      page,
      limit: 12,
    }
    try {
      const result = await listProducts(params, categoryMap)
      setProducts(result.items)
      setTotal(result.total || 0)
      setPages(result.pages || 1)
      setStatus('success')
    } catch (requestError) {
      setError(requestError.message)
      setStatus('error')
    }
  }, [category, categoryMap, page, priceRange, search, sort])

  useEffect(() => { const timer = window.setTimeout(loadProducts, 0); return () => window.clearTimeout(timer) }, [loadProducts])
  const updateSearch = (value) => { setStatus('loading'); setPage(1); setSearch(value) }
  const updateCategory = (value) => { setStatus('loading'); setPage(1); setCategory(value) }
  const updateSort = (value) => { setStatus('loading'); setPage(1); setSort(value) }
  const updatePriceRange = (value) => { setStatus('loading'); setPage(1); setPriceRange(value) }

  return <div className="page-width listing-page"><Breadcrumb current="All products" /><div className="listing-heading"><div><span className="eyebrow">The collection</span><h1>Kitchen essentials,<br /><em>chosen well.</em></h1><p>From first chop to final wipe, find the tools that make everyday cooking feel good.</p></div><span className="product-count">{total} products</span></div><ProductFilters search={search} setSearch={updateSearch} category={category} setCategory={updateCategory} categories={categoryOptions} sort={sort} setSort={updateSort} priceRange={priceRange} setPriceRange={updatePriceRange} />{status === 'loading' ? <LoadingState /> : status === 'error' ? <div className="inline-error"><p>{error}</p><Button variant="outline" onClick={() => { setStatus('loading'); loadProducts() }}>Try again</Button></div> : products.length ? <ProductGrid products={products} /> : <EmptyState title="No products found" description="Try a different search or category." />}<div className="pagination">{Array.from({ length: Math.min(pages, 5) }, (_, index) => index + 1).map((item) => <Button variant={`pagination${page === item ? ' active' : ''}`} key={item} onClick={() => setPage(item)}>{item}</Button>)}{page < pages && <Button variant="pagination" onClick={() => setPage(page + 1)}>Next →</Button>}</div><div className="listing-note"><span>✦</span><p>All product information is loaded from the Kitchenly catalog.</p><Link to="/">Learn more →</Link></div></div>
}

export default Products
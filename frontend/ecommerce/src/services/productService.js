import { productsApi } from './api'
import { getFallbackImage, getProductImage } from '../utils/imageUrl'

function getCategoryName(category, categoryMap = {}) {
  if (typeof category === 'string') return categoryMap[category] || category
  return category?.name || categoryMap[category?._id] || ''
}

function getProductId(product) {
  return product?._id || product?.id || product?.legacyId
}

export function normalizeProduct(product, categoryMap) {
  if (!product) return null

  const originalPrice = product.price ?? 0
  const currentPrice = product.discountPrice ?? originalPrice
  const images = Array.isArray(product.images) ? product.images : []
  const thumbnail = getProductImage(product)

  return {
    ...product,
    id: getProductId(product),
    category: getCategoryName(product.category, categoryMap),
    image: thumbnail,
    gallery: images.length
      ? images.map((image, index) => getProductImage({ ...product, images }, index))
      : [getFallbackImage(product)],
    price: currentPrice,
    oldPrice: originalPrice,
    originalPrice,
    discountPercentage: product.discountPercentage ?? 0,
    reviews: product.reviewCount ?? product.reviews ?? 0,
    badge: product.isBestSeller
      ? 'Bestseller'
      : product.isNewArrival
        ? 'New arrival'
        : product.isFeatured
          ? 'Featured'
          : '',
  }
}

export function normalizeProducts(items = [], categoryMap) {
  return items.map((product) => normalizeProduct(product, categoryMap)).filter(Boolean)
}

export async function listProducts(params, categoryMap) {
  const response = await productsApi.list(params)
  return {
    ...response.data,
    items: normalizeProducts(response.data.items, categoryMap),
  }
}

export async function getProduct(id) {
  const response = await productsApi.getById(id)
  return {
    ...response.data,
    product: normalizeProduct(response.data.product),
  }
}

export default {
  listProducts,
  getProduct,
  normalizeProduct,
  normalizeProducts,
}
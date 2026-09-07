const fallbackImage = 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=900&q=85'

const categoryImages = {
  Appliances: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=900&q=85',
  Bakeware: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=85',
  Cleaning: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=900&q=85',
  Cookware: 'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=900&q=85',
  Cutlery: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=900&q=85',
  Dining: 'https://images.unsplash.com/photo-1603199506016-b9a594b593c0?auto=format&fit=crop&w=900&q=85',
  Drinkware: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=85',
  'Kitchen Tools': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=900&q=85',
  Organization: 'https://images.unsplash.com/photo-1584473457493-17c4c24290c2?auto=format&fit=crop&w=900&q=85',
  Storage: 'https://images.unsplash.com/photo-1584473457493-17c4c24290c2?auto=format&fit=crop&w=900&q=85',
}

const keywordImages = [
  { keywords: ['air fryer', 'induction', 'cooktop', 'oven', 'stove'], url: categoryImages.Appliances },
  { keywords: ['knife', 'cutlery', 'chopping', 'cutting'], url: categoryImages.Cutlery },
  { keywords: ['dinner', 'plate', 'bowl', 'dining'], url: categoryImages.Dining },
  { keywords: ['flask', 'bottle', 'mug', 'glass'], url: categoryImages.Drinkware },
  { keywords: ['storage', 'container', 'rack', 'organizer'], url: categoryImages.Storage },
]

function isAbsoluteUrl(value) {
  return typeof value === 'string' && /^https?:\/\//i.test(value)
}

function getCategoryValue(category) {
  return typeof category === 'string' ? category : category?.name || ''
}

export function getFallbackImage(product = {}) {
  const searchableText = `${product.name || ''} ${product.subcategory || ''}`.toLowerCase()
  const keywordMatch = keywordImages.find(({ keywords }) => keywords.some((keyword) => searchableText.includes(keyword)))
  const category = getCategoryValue(product.category)
  return keywordMatch?.url || categoryImages[category] || fallbackImage
}

export function getImageUrl(image, product = {}) {
  if (isAbsoluteUrl(image)) return image
  return getFallbackImage(product)
}

export function getProductImage(product = {}, index = 0) {
  const images = Array.isArray(product.images) ? product.images : []
  const image = images[index] || product.thumbnail || images[0]
  return getImageUrl(image, product)
}

export function getSafeFallbackImage() {
  return fallbackImage
}
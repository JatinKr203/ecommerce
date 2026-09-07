import { useState } from 'react'
import { getFallbackImage } from '../../utils/imageUrl'

function ProductGallery({ product }) {
  const [selected, setSelected] = useState(product.gallery[0])
  const handleImageError = (event) => { event.currentTarget.onerror = null; event.currentTarget.src = getFallbackImage(product) }
  return <div className="product-gallery"><div className="gallery-main"><img src={selected} alt={product.name} onError={handleImageError} /></div><div className="gallery-thumbs">{product.gallery.map((image) => <button className={selected === image ? 'gallery-thumb selected' : 'gallery-thumb'} type="button" key={image} onClick={() => setSelected(image)}><img src={image} alt="" onError={handleImageError} /></button>)}</div></div>
}

export default ProductGallery
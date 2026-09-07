import { Link } from 'react-router-dom'

function Breadcrumb({ current, parent = 'Shop' }) {
  return (
    <div className="breadcrumb">
      <Link to="/">Home</Link><span>/</span><Link to="/products">{parent}</Link><span>/</span><strong>{current}</strong>
    </div>
  )
}

export default Breadcrumb
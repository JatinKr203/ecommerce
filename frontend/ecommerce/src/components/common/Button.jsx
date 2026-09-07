import { Link } from 'react-router-dom'

function Button({ children, to, variant = 'primary', className = '', type = 'button', ...props }) {
  const classes = `button button-${variant} ${className}`.trim()
  if (to) return <Link className={classes} to={to} {...props}>{children}</Link>
  return <button className={classes} type={type} {...props}>{children}</button>
}

export default Button
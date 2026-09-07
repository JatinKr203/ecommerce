import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Button from '../components/common/Button'
import FormField from '../components/common/FormField'
import { useAuth } from '../context/useAuth'

const initialValues = { name: '', email: '', password: '', confirmPassword: '' }

function validate(values, register) {
  const errors = {}
  if (register && !values.name.trim()) errors.name = 'Full name is required'
  if (!values.email.trim()) errors.email = 'Email is required'
  else if (!/^\S+@\S+\.\S+$/.test(values.email)) errors.email = 'Enter a valid email address'
  if (!values.password) errors.password = 'Password is required'
  else if (values.password.length < 8) errors.password = 'Password must be at least 8 characters'
  if (register && values.password !== values.confirmPassword) errors.confirmPassword = 'Passwords do not match'
  return errors
}

function AuthPage({ register = false }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, register: registerUser } = useAuth()
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const updateValue = (field) => (event) => setValues((current) => ({ ...current, [field]: event.target.value }))
  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = validate(values, register)
    setErrors(nextErrors)
    setFormError('')
    if (Object.keys(nextErrors).length) return

    setSubmitting(true)
    try {
      if (register) {
        await registerUser({ name: values.name.trim(), email: values.email.trim(), password: values.password })
        navigate('/login', { replace: true, state: { registered: true } })
      } else {
        await login({ email: values.email.trim(), password: values.password })
        navigate(location.state?.from || '/', { replace: true })
      }
    } catch (error) {
      setFormError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const registeredMessage = !register && location.state?.registered

  return <div className="auth-page"><div className="auth-panel"><div className="auth-form-wrap"><Link className="auth-logo brand" to="/"><span className="brand-mark">K</span><span>Kitchenly</span></Link><span className="eyebrow">{register ? 'Join the table' : 'Welcome back'}</span><h1>{register ? 'Make room for good things.' : 'Good to see you again.'}</h1><p className="auth-intro">{register ? 'Create an account and keep your favorite kitchen finds close.' : 'Sign in to view your orders, saved pieces, and more.'}</p>{registeredMessage && <div className="form-notice">Account created. Sign in to continue.</div>}{formError && <div className="form-error-banner" role="alert">{formError}</div>}<form className="auth-form" onSubmit={handleSubmit} noValidate>{register && <FormField label="Full name" value={values.name} onChange={updateValue('name')} placeholder="Your name" error={errors.name} required /> }<FormField label="Email address" type="email" value={values.email} onChange={updateValue('email')} placeholder="you@example.com" error={errors.email} required /><label className="form-field"><span>Password</span><div className="password-input"><input type={showPassword ? 'text' : 'password'} value={values.password} onChange={updateValue('password')} placeholder="At least 8 characters" aria-invalid={Boolean(errors.password)} required /><button type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? 'Hide' : 'Show'}</button></div>{errors.password && <small className="form-error">{errors.password}</small>}</label>{register && <FormField label="Confirm password" type="password" value={values.confirmPassword} onChange={updateValue('confirmPassword')} placeholder="Repeat your password" error={errors.confirmPassword} required />}{register ? <label className="check-field"><input type="checkbox" required /><span>I agree to the terms and privacy policy.</span></label> : <div className="form-options"><label className="check-field"><input type="checkbox" /><span>Remember me</span></label><a href="#forgot">Forgot password?</a></div>}<Button type="submit" className="full-button" disabled={submitting}>{submitting ? (register ? 'Creating account...' : 'Signing in...') : (register ? 'Create account' : 'Sign in')}</Button></form>{!register && <><div className="auth-divider"><span>or continue with</span></div><Button variant="social"><span>G</span> Continue with Google</Button></>}<p className="auth-switch">{register ? 'Already have an account?' : 'New to Kitchenly?'} <Link to={register ? '/login' : '/register'}>{register ? 'Sign in' : 'Create an account'}</Link></p></div><div className="auth-image"><img src="https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=85" alt="A calm, light-filled kitchen" /><div><span>“</span><p>The tools you use shape the food you make, and the moments around it.</p><small>— Kitchenly journal</small></div></div></div></div>
}

export function Login() { return <AuthPage /> }
export function Register() { return <AuthPage register /> }
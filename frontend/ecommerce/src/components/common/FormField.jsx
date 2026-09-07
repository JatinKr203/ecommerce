function FormField({ label, error, className = '', ...props }) {
  return <label className={`form-field ${className}`.trim()}><span>{label}</span><input {...props} />{error && <small className="form-error">{error}</small>}</label>
}

export default FormField
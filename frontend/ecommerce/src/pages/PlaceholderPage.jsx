function PlaceholderPage({ eyebrow = 'Coming next', title, description }) {
  return (
    <section className="placeholder-page">
      <div className="placeholder-panel">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </section>
  )
}

export default PlaceholderPage
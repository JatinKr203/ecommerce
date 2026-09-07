function EmptyState({ title = 'Nothing here yet', description = 'Try adjusting your filters or come back soon.' }) {
  return <div className="empty-state"><span className="empty-icon">○</span><h3>{title}</h3><p>{description}</p></div>
}

export default EmptyState
export default function SkeletonCard() {
  return (
    <article className="skeleton-card" aria-hidden="true">
      <div className="editorial-card-content" style={{ gap: '12px' }}>
        <div className="skeleton" style={{ height: '24px', width: '70%' }} />
        <div className="skeleton" style={{ height: '16px', width: '90%' }} />
        <div className="skeleton" style={{ height: '16px', width: '50%' }} />
        <div className="skeleton" style={{ height: '20px', width: '40%', marginTop: 'auto' }} />
      </div>
      <div className="skeleton" style={{ width: '110px', height: '110px', flexShrink: 0, borderRadius: '12px' }} />
    </article>
  );
}

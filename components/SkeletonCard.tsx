export default function SkeletonCard() {
  return (
    <article
      className="flex items-center gap-3 rounded-card border border-border bg-surface p-3"
      aria-hidden="true"
    >
      <div className="flex flex-1 flex-col gap-3">
        <div className="skeleton h-6 w-[70%]" />
        <div className="skeleton h-4 w-[90%]" />
        <div className="skeleton h-4 w-1/2" />
        <div className="skeleton mt-auto h-5 w-2/5" />
      </div>
      <div className="skeleton h-[110px] w-[110px] shrink-0 rounded-xl" />
    </article>
  );
}

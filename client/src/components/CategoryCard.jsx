function CategoryCard({ category }) {
  return (
    <a
      className={`group relative flex min-h-76 flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br p-6 text-white ${category.colors}`}
      href="#products"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          backgroundImage:
            'repeating-linear-gradient(180deg, #fff 0px, #fff 1px, transparent 1px, transparent 9px)',
        }}
      />

      <div className="relative flex items-start justify-between">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[.16em] text-white/70">
          {category.count} pieces
        </span>
        <span className="text-4xl text-white/80 transition-transform duration-500 group-hover:-translate-y-1">
          {category.icon}
        </span>
      </div>

      <div className="relative flex items-end justify-between">
        <h3 className="max-w-40 text-3xl font-semibold leading-[.95] tracking-[-.05em]">
          {category.name}
        </h3>
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-xl text-black transition duration-500 group-hover:rotate-45">
          ↗
        </span>
      </div>
    </a>
  );
}

export default CategoryCard;
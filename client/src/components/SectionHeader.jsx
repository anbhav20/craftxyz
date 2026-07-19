function SectionHeader({ eyebrow, title, description }) {
  return (
    <header className="relative mb-10 grid gap-5 pt-5 sm:grid-cols-[1fr_300px] sm:items-end">
      <div
        className="absolute inset-x-0 top-0 h-px opacity-35"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, #141311 0, #141311 6px, transparent 6px, transparent 11px)',
        }}
      />
      <div>
        <p className="font-mono text-[10px] font-bold uppercase tracking-[.18em] text-[#FF4B12]">
          {eyebrow}
        </p>
        <h2 className="mt-3 max-w-3xl text-4xl font-semibold leading-[.95] tracking-[-.05em] text-[#141311] sm:text-5xl lg:text-6xl">
          {title}
        </h2>
      </div>
      <p className="text-sm leading-6 text-[#141311]/60">{description}</p>
    </header>
  );
}

export default SectionHeader;
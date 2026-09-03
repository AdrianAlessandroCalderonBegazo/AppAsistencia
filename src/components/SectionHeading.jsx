export default function SectionHeading({ eyebrow, title, description, align = 'center', light = false }) {
  const alignClass = align === 'left' ? 'items-start text-left' : 'items-center text-center'
  return (
    <div className={`flex flex-col ${alignClass} gap-3 mb-10 md:mb-14`}>
      {eyebrow && <span className="section-eyebrow">{eyebrow}</span>}
      {title && (
        <h2 className={`font-black text-3xl md:text-4xl leading-tight ${light ? 'text-white' : 'text-icr-navy'}`}>
          {title}
        </h2>
      )}
      {description && (
        <p className={`max-w-2xl text-base md:text-lg ${light ? 'text-white/80' : 'text-icr-navy/70'}`}>
          {description}
        </p>
      )}
    </div>
  )
}

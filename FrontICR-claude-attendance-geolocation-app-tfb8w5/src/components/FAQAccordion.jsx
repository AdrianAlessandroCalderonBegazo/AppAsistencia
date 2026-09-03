import { useState } from 'react'

export default function FAQAccordion({ items }) {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <div className="divide-y divide-icr-navy/10 rounded-2xl border border-icr-navy/10 bg-white shadow-sm">
      {items.map((item, i) => {
        const isOpen = openIndex === i
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? -1 : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-bold text-icr-navy md:px-6 md:py-5"
            >
              <span>{item.q}</span>
              <svg
                viewBox="0 0 24 24"
                className={`h-5 w-5 shrink-0 text-icr-cyan transition-transform ${isOpen ? 'rotate-45' : ''}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
            </button>
            <div
              className={`grid overflow-hidden transition-all duration-300 ${
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden px-5 pb-5 text-sm leading-relaxed text-icr-navy/70 md:px-6">
                {item.a}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

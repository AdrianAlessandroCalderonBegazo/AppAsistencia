import { whatsappLink } from '../data/content'

function WhatsAppGlyph({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor">
      <path d="M16.02 3C9.4 3 4 8.37 4 15c0 2.35.68 4.53 1.86 6.38L4 29l7.8-1.82A11.9 11.9 0 0016.02 27C22.64 27 28 21.63 28 15S22.64 3 16.02 3zm0 21.8c-1.98 0-3.83-.55-5.4-1.5l-.39-.23-4.63 1.08 1.1-4.5-.25-.4A9.7 9.7 0 016.2 15c0-5.42 4.4-9.8 9.82-9.8 5.42 0 9.82 4.38 9.82 9.8s-4.4 9.8-9.82 9.8zm5.4-7.35c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.66.15-.2.3-.76.96-.93 1.15-.17.2-.34.22-.63.08-.3-.15-1.25-.46-2.38-1.46-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.34.44-.5.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.66-1.58-.9-2.17-.24-.57-.48-.5-.66-.5h-.56c-.2 0-.52.08-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.22 3.07.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.4.24-.7.24-1.3.17-1.4-.07-.13-.27-.2-.57-.35z" />
    </svg>
  )
}

export default function WhatsAppButton({
  message,
  label = 'Escríbenos por WhatsApp',
  className = '',
  variant = 'solid',
}) {
  const base =
    'inline-flex items-center gap-2 rounded-full px-6 py-3 font-bold transition-transform hover:scale-105'
  const styles =
    variant === 'solid'
      ? 'bg-[#25D366] text-white shadow-card'
      : 'border-2 border-white text-white hover:bg-white/10'

  return (
    <a
      href={whatsappLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} ${styles} ${className}`}
    >
      <WhatsAppGlyph />
      {label}
    </a>
  )
}

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext.jsx'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center rounded-xl border border-neutral-border dark:border-zinc-800 p-2 text-zinc-500 hover:bg-neutral-bg dark:hover:bg-zinc-800 dark:text-zinc-400"
      aria-label="cambiar tema"
      title="cambiar tema"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}

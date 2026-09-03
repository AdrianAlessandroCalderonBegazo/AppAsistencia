import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  UserPlus,
  UserMinus,
  Clock,
  History,
  MessageSquare,
  FileDown,
  Building2,
  LogOut,
  Menu,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import ThemeToggle from './ThemeToggle.jsx'

const NAV_ITEMS = [
  { to: '/', label: 'dashboard', icon: LayoutDashboard, end: true },
  { to: '/empleados/alta', label: 'alta de empleado', icon: UserPlus },
  { to: '/empleados/baja', label: 'baja de empleado', icon: UserMinus },
  { to: '/horarios', label: 'horarios', icon: Clock },
  { to: '/asistencias', label: 'asistencias', icon: History },
  { to: '/solicitudes', label: 'solicitudes de corrección', icon: MessageSquare },
  { to: '/reportes', label: 'reportes', icon: FileDown },
  { to: '/sedes', label: 'sedes', icon: Building2 },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="flex">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-neutral-border bg-white dark:border-zinc-800 dark:bg-zinc-950 transition-transform lg:static lg:translate-x-0 ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex h-16 items-center gap-2 border-b border-neutral-border px-5 dark:border-zinc-800">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-solid text-sm font-semibold text-white">
              IC
            </div>
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">control de asistencia</span>
          </div>

          <nav className="flex flex-col gap-1 p-3">
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-accent-bg text-accent-text dark:bg-accent-darkBg dark:text-accent-darkText'
                      : 'text-zinc-600 hover:bg-neutral-bg dark:text-zinc-400 dark:hover:bg-zinc-900'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 border-t border-neutral-border p-3 dark:border-zinc-800">
            <div className="mb-2 px-2 text-xs text-zinc-400">
              {user?.nombre || user?.dni || 'administrador'}
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-danger-solid hover:bg-danger-bg dark:hover:bg-danger-darkBg"
            >
              <LogOut size={18} />
              cerrar sesión
            </button>
          </div>
        </aside>

        {open && (
          <div
            className="fixed inset-0 z-30 bg-zinc-900/40 lg:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
        )}

        <div className="flex min-h-screen w-full flex-col lg:pl-64">
          <header className="flex h-16 items-center justify-between border-b border-neutral-border px-4 dark:border-zinc-800 sm:px-6">
            <button
              className="rounded-xl border border-neutral-border p-2 text-zinc-500 dark:border-zinc-800 lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="abrir menú"
            >
              <Menu size={18} />
            </button>
            <div className="hidden lg:block" />
            <ThemeToggle />
          </header>

          <main className="flex-1 p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

// tabla simple y reutilizable: columns = [{ key, header, render? }]
export default function DataTable({ columns, rows, rowKey = 'id', emptyMessage = 'sin resultados por ahora' }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-dashed border-neutral-border py-14 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-neutral-border dark:border-zinc-800">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-neutral-border bg-neutral-bg/60 dark:border-zinc-800 dark:bg-zinc-900/60">
            {columns.map((col) => (
              <th
                key={col.key}
                className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row[rowKey]}
              className="border-b border-neutral-border last:border-0 hover:bg-neutral-bg/50 dark:border-zinc-800 dark:hover:bg-zinc-900/50"
            >
              {columns.map((col) => (
                <td key={col.key} className="whitespace-nowrap px-4 py-3 text-zinc-700 dark:text-zinc-300">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

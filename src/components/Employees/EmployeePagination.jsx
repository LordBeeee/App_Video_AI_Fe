import { PageBtn } from './EmployeeUI'

export default function EmployeePagination({ page, totalPages, total, showing, onPageChange }) {
  const pageNums = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    const start = Math.min(Math.max(page - 2, 1), Math.max(totalPages - 4, 1))
    return start + i
  })

  return (
    <div className="px-6 py-4 border-t border-outline-variant/10 flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface-container-low/30">
      <span className="text-sm text-slate-400">
        Hiển thị {showing} trong tổng số {total} nhân viên
      </span>

      <div className="flex gap-2">
        <PageBtn icon="chevron_left" disabled={page === 1} onClick={() => onPageChange(p => p - 1)} />

        {pageNums.map(p => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-10 h-10 rounded-lg border font-medium transition-colors ${
              p === page
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-outline-variant/20 hover:bg-surface-container-highest text-on-surface'
            }`}
          >
            {p}
          </button>
        ))}

        <PageBtn icon="chevron_right" disabled={page >= totalPages} onClick={() => onPageChange(p => p + 1)} />
      </div>
    </div>
  )
}
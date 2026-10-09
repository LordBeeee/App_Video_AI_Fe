export default function Project() {
  return (
    <div className="mx-auto flex h-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div>
        <h1 className="text-2xl font-semibold text-on-background">Dự Án</h1>
        <p className="mt-1 text-sm text-on-surface-variant">Tính năng đang được phát triển...</p>
      </div>
      <div className="flex min-h-56 items-center justify-center rounded-2xl border border-dashed border-primary/30 bg-white text-on-surface-variant">
        <span className="material-symbols-outlined mr-2 text-primary">construction</span>
        Tính năng đang được hoàn thiện
      </div>
    </div>
  )
}

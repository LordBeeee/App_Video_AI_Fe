import InfoPanel from "../Library/InfoPanel";

export function MobileGenerationResult({ result, modality, onCopyPrompt, promptCopied }) {
  return (
    <>
      {result && (
            <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-4 lg:hidden">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-semibold">Kết quả gần nhất</p>
                <span className="text-xs text-slate-500">{result.status}</span>
              </div>
              {result.outputUrls?.length > 0 && (
                <InfoPanel
                  item={result}
                  variant="inline"
                  onCopyPrompt={onCopyPrompt}
                  promptCopied={promptCopied}
                />
              )}
              {!result.outputUrls?.length && (
                <p
                  className={
                    result.status === "failed"
                      ? "text-sm text-red-300"
                      : "text-sm text-on-surface-variant"
                  }
                >
                  {result.errorMessage || "Nội dung đang được xử lý…"}
                </p>
              )}
              {result.outputUrls?.map((url) => (
                <div
                  key={url}
                  className="mb-3 overflow-hidden rounded-xl bg-black/30"
                >
                  {modality === "image" && (
                    <img
                      src={url}
                      className="max-h-80 w-full object-contain"
                      alt="Generated"
                    />
                  )}
                  {modality === "video" && (
                    <video src={url} controls className="max-h-80 w-full" />
                  )}
                  {modality === "audio" && (
                    <audio src={url} controls className="w-full p-3" />
                  )}
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="block border-t border-outline-variant px-3 py-2 text-center text-xs text-primary"
                  >
                    Mở hoặc tải xuống
                  </a>
                </div>
              ))}
            </div>
          )}
    </>
  );
}

export function DesktopGenerationResult({ result, modality, icon, onCopyPrompt, promptCopied }) {
  return (
      <section className="relative hidden min-w-0 flex-1 flex-col items-center justify-center overflow-hidden bg-background px-4 xl:px-6 lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(243,136,32,0.10),transparent_48%)]" />
        <div className="relative z-10 flex w-full flex-col items-center">
          {!result && (
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-primary/20 bg-primary-container">
                <span className="material-symbols-outlined text-4xl text-primary">
                  {icon}
                </span>
              </div>
              <h2 className="text-2xl font-semibold">Sẵn sàng sáng tạo</h2>
              <p className="mt-2 text-sm text-slate-500">
                Chọn model, nhập prompt và xem giá trước khi tạo.
              </p>
            </div>
          )}
          {result && !result.outputUrls?.length && (
            <div className="text-center">
              <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-2 border-primary/15 border-t-primary" />
              <h2 className="text-xl font-semibold">
                {result.status === "failed"
                  ? "Tạo nội dung thất bại"
                   : "Kling đang xử lý..."}
              </h2>
              <p
                className={`mt-2 text-sm ${result.status === "failed" ? "text-red-300" : "text-slate-500"}`}
              >
                {result.errorMessage ||
                  "Video thường mất vài phút để hoàn tất."}
              </p>
            </div>
          )}
          {result?.outputUrls?.length > 0 && (
            <div className="w-full">
              <InfoPanel
                item={result}
                variant="inline"
                onCopyPrompt={onCopyPrompt}
                promptCopied={promptCopied}
              />
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30 shadow-2xl">
                {modality === "image" && (
                  <div className={`grid gap-2 ${result.outputUrls.length > 1 ? "sm:grid-cols-2" : "grid-cols-1"}`}>
                    {result.outputUrls.map((url) => (
                      <img
                        key={url}
                        src={url}
                        className="max-h-[72vh] w-full object-contain xl:max-h-[76vh]"
                        alt="Generated"
                      />
                    ))}
                  </div>
                )}
                {modality === "video" && (
                  <video
                    src={result.outputUrls[0]}
                    controls
                    className="max-h-[72vh] w-full object-contain xl:max-h-[76vh]"
                  />
                )}
                {modality === "audio" && (
                  <div className="p-6 lg:p-8">
                    <audio
                      src={result.outputUrls[0]}
                      controls
                      autoPlay
                      className="w-full"
                    />
                  </div>
                )}
              </div>
              <div className="mt-5 flex items-center justify-between text-sm text-on-surface-variant">
                <span>Đã lưu vào Thư viện</span>
                <div className="flex items-center gap-4">
                  <a
                    href={result.outputUrls[0]}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:text-primary-hover"
                  >
                    Tải xuống
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
  );
}

import InfoPanel from "../Library/InfoPanel";
import { Empty } from "../Aurora/AuroraUI";

const lastFrameDownloadUrl = (url) => url?.replace("/image/upload/", "/image/upload/fl_attachment/");

export function MobileGenerationResult({ result, modality, onCopyPrompt, promptCopied }) {
  if (!result) return null;
  return (
    <div className="st-box st-mres">
      <p className="st-lb">
        Kết quả gần nhất
        <em>{result.status}</em>
      </p>
      {result.outputUrls?.length > 0 && (
        <InfoPanel item={result} variant="inline" onCopyPrompt={onCopyPrompt} promptCopied={promptCopied} />
      )}
      {!result.outputUrls?.length && (
        <p className={`st-note${result.status === "failed" ? " bad" : ""}`}>
          {result.errorMessage || "Nội dung đang được xử lý…"}
        </p>
      )}
      {result.outputUrls?.map((url) => (
        <div key={url}>
          <div className="st-media">
            {modality === "image" && <img src={url} alt="Generated" />}
            {modality === "video" && <video src={url} controls />}
            {modality === "audio" && <div className="st-aud"><audio src={url} controls /></div>}
          </div>
          <a href={url} target="_blank" rel="noreferrer">Mở hoặc tải xuống</a>
          {modality === "video" && result.lastFrameUrl && (
            <a href={lastFrameDownloadUrl(result.lastFrameUrl)} target="_blank" rel="noreferrer">Tải ảnh cuối</a>
          )}
        </div>
      ))}
    </div>
  );
}

export function DesktopGenerationResult({ result, modality, icon, onCopyPrompt, promptCopied }) {
  return (
    <section className="au-card st-res">
      <div className="st-res-in">
        {!result && (
          <Empty icon={icon} text="Sẵn sàng sáng tạo" hint="Chọn model, nhập prompt và xem giá trước khi tạo." />
        )}
        {result && !result.outputUrls?.length && (
          <div className="st-wait">
            <div className="st-spin" />
            <h2 className="au-fd">
              {result.status === "failed" ? "Tạo nội dung thất bại" : "Đang xử lý..."}
            </h2>
            <p className={result.status === "failed" ? "bad" : ""}>
              {result.errorMessage || "Nội dung thường mất vài phút để hoàn tất."}
            </p>
          </div>
        )}
        {result?.outputUrls?.length > 0 && (
          <div>
            <InfoPanel item={result} variant="inline" onCopyPrompt={onCopyPrompt} promptCopied={promptCopied} />
            {modality === "audio" ? (
              <div className="st-media st-aud">
                <audio src={result.outputUrls[0]} controls autoPlay />
              </div>
            ) : (
              <div className={`st-media${modality === "image" && result.outputUrls.length > 1 ? " grid2" : ""}`}>
                {modality === "image" &&
                  result.outputUrls.map((url) => <img key={url} src={url} alt="Generated" />)}
                {modality === "video" && <video src={result.outputUrls[0]} controls />}
              </div>
            )}
            <div className="st-rf">
              <span>Đã lưu vào Thư viện</span>
              <a className="au-btn" href={result.outputUrls[0]} target="_blank" rel="noreferrer">
                <span className="material-symbols-outlined">download</span>Tải xuống
              </a>
              {modality === "video" && result.lastFrameUrl && (
                <a className="au-btn" href={lastFrameDownloadUrl(result.lastFrameUrl)} target="_blank" rel="noreferrer">
                  <span className="material-symbols-outlined">image</span>Tải ảnh cuối
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

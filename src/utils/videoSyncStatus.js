const finishedProvider = (status) => ["succeeded", "succeed", "completed"].includes(status);
const providerName = (source) => source === "kling" ? "Kling" : source === "seedance" ? "Seedance" : source === "veo" ? "Veo" : "Nhà cung cấp";

export function videoSyncTitle(item) {
  if (!item || item.modality !== "video") return "Đang xử lý...";
  if (item.status === "failed") return "Tạo video thất bại";
  if (finishedProvider(item.providerStatus) && item.status !== "succeeded") {
    return item.syncErrorCode ? "Video đã tạo, đang thử lưu lại" : "Video đã tạo, đang lưu kết quả";
  }
  return "Đang tạo video...";
}

export function videoSyncMessage(item) {
  if (!item || item.modality !== "video") return item?.errorMessage || "Nội dung thường mất vài phút để hoàn tất.";
  if (item.status === "failed") return item.errorMessage || "Tạo video thất bại.";
  if (item.syncErrorMessage) return item.syncErrorMessage;
  if (finishedProvider(item.providerStatus) && item.status !== "succeeded") {
    const provider = providerName(item.source);
    const stages = {
      downloading_video: `${provider} đã tạo xong video. Hệ thống đang tải video để lưu trữ.`,
      checking_storage: `${provider} đã tạo xong video. Hệ thống đang kiểm tra kho lưu trữ.`,
      uploading_cloudinary: `${provider} đã tạo xong video. Hệ thống đang tải lên Cloudinary.`,
      saving_result: `${provider} đã tạo xong video. Hệ thống đang lưu vào thư viện.`,
      calculating_charge: "Video đã lưu. Hệ thống đang tính chi phí cuối cùng.",
      settling_wallet: "Video đã lưu. Hệ thống đang quyết toán ví.",
    };
    return stages[item.processingStage] || `${provider} đã tạo xong video. Hệ thống đang lưu kết quả.`;
  }
  return `${providerName(item.source)} đang tạo video. Trạng thái sẽ tự cập nhật.`;
}

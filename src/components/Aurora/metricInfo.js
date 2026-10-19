
export const INFO = {
  totalSpend: {
    title: 'Tổng chi',
    what: 'Tổng số tiền nhân viên đã bị trừ ví cho các yêu cầu AI thành công trong khoảng thời gian đang chọn.',
    read: 'Đường biểu đồ bên dưới là chi tiêu từng ngày. Đường dốc lên nghĩa là ngày đó chi nhiều hơn; rê chuột vào một điểm để xem số tiền và số yêu cầu.',
    note: 'Yêu cầu lỗi không bị tính tiền nên không nằm trong con số này.',
  },
  avgPerDay: {
    title: 'Trung bình mỗi ngày',
    what: 'Tổng chi chia cho số ngày trong khoảng đã chọn (tính cả ngày không phát sinh chi tiêu).',
    read: 'Dùng làm mốc: ngày nào cao hơn rõ rệt so với con số này là ngày bất thường.',
  },
  peakDay: {
    title: 'Ngày chi cao nhất',
    what: 'Ngày có tổng chi lớn nhất trong khoảng đã chọn, kèm số tiền.',
    read: 'Nếu đỉnh cao gấp nhiều lần mức trung bình, hãy xem ngày đó ai dùng nhiều ở bảng Xếp hạng.',
  },
  succeeded: {
    title: 'Thành công',
    what: 'Số yêu cầu AI đã chạy xong và trả được kết quả trong kỳ.',
    read: 'Số nhỏ dưới thẻ là tổng số yêu cầu (thành công + lỗi). Chia hai số này ra là tỷ lệ thành công.',
  },
  spenders: {
    title: 'Người chi tiêu',
    what: 'Số nhân viên có ít nhất một yêu cầu thành công trong kỳ, trên tổng số nhân viên.',
    read: 'Ví dụ 6/10 nghĩa là 4 người chưa dùng AI trong kỳ. Phần trăm dưới thẻ cho biết mức độ lan tỏa trong đội.',
  },
  avgPrice: {
    title: 'Giá trung bình',
    what: 'Tổng chi chia cho số yêu cầu thành công, tức một lần AI trả kết quả tốn bao nhiêu tiền.',
    read: 'Giá cao có thể do dùng mô hình đắt hoặc tạo video nhiều, chưa chắc là lãng phí. Xem thêm biểu đồ Loại tác vụ và Mô hình top.',
    note: 'Không đo chất lượng đầu ra, nên giá thấp chưa chắc hiệu quả hơn.',
  },
  failed: {
    title: 'Lỗi',
    what: 'Số yêu cầu AI kết thúc với trạng thái lỗi trong kỳ. Lỗi không được tính vào Tổng chi và Giá trung bình.',
    read: 'Phần trăm dưới thẻ là lỗi trên tổng yêu cầu. Nếu cao bất thường, xem biểu đồ Lý do lỗi phổ biến ở phần Hiệu quả sử dụng AI bên dưới.',
  },
  byTask: {
    title: 'Loại tác vụ',
    what: 'Chi phí chia theo loại việc: chat, tạo ảnh, tạo video, giọng nói.',
    read: 'Mỗi lát tròn là tỷ trọng chi phí của loại đó, không phải số lượt. Một vài video có thể tốn hơn hàng trăm tin nhắn chat. Số ở giữa là tổng chi.',
  },
  topModels: {
    title: 'Mô hình top',
    what: 'Năm mô hình AI tốn tiền nhất trong kỳ.',
    read: 'Thanh dài là chi phí cao hơn. Dòng nhỏ bên dưới là loại tác vụ, số yêu cầu và phần trăm trên tổng chi. Mô hình ít yêu cầu mà chi phí lớn thường là mô hình đắt.',
  },
  ranking: {
    title: 'Xếp hạng nhân viên',
    what: 'Danh sách nhân viên theo mức chi tiêu AI trong kỳ.',
    read: 'Đổi chiều sắp xếp bằng nút mũi tên. Bấm vào một người để xem chi tiết cách họ dùng AI. Biểu tượng tia sét là số yêu cầu, dấu chấm than là số lỗi.',
    note: 'Chi nhiều chưa chắc dùng sai: hãy so với số yêu cầu thành công và Điểm hiệu quả.',
  },
  effSuccessRate: {
    title: 'Tỷ lệ thành công',
    what: 'Thành công ÷ (thành công + lỗi). Yêu cầu đang chạy dở không được tính.',
    read: 'Càng gần 100% càng ổn định. Dưới 80% là dấu hiệu nên xem lại mô hình hoặc cách viết prompt.',
  },
  effRetryRate: {
    title: 'Prompt lặp lại',
    what: 'Tỷ lệ yêu cầu gửi lại đúng nội dung prompt mà cùng một người đã gửi trước đó (không phân biệt hoa thường, khoảng trắng đầu cuối).',
    read: 'Càng thấp càng tốt: ít phải tạo lại nghĩa là lần đầu đã ra kết quả dùng được.',
    note: 'Sửa prompt dù chỉ một chữ thì không bị tính là lặp.',
  },
  effCostPerSuccess: {
    title: 'Chi phí mỗi lượt thành công',
    what: 'Tổng tiền chi chia cho số lượt thành công trong kỳ.',
    read: 'Dùng để so sánh các kỳ hoặc các nhóm với nhau. Ở trang một nhân viên, dòng nhỏ cho biết mức của cả nhóm.',
  },
  effLatency: {
    title: 'Thời gian xử lý trung bình',
    what: 'Thời gian từ lúc gửi yêu cầu đến lúc có kết quả, trung bình của các lượt ảnh, video và giọng nói thành công.',
    read: 'Tác vụ chat không nằm trong số liệu này.',
  },
  stability: {
    title: 'Độ ổn định',
    what: 'Hai vòng tròn cho biết hệ thống AI chạy trơn tru đến đâu trong kỳ.',
    read: 'Vòng ngoài (cam) là tỷ lệ yêu cầu thành công, con số lớn ở giữa. Vòng trong (vàng) là tỷ lệ yêu cầu không phải gửi lại prompt cũ. Cả hai vòng càng đầy càng tốt.',
    note: 'Chỉ đo thành công hay lỗi, không đo chất lượng hình ảnh hay nội dung.',
  },
  costLine: {
    title: 'Chi phí mỗi lượt thành công theo ngày',
    what: 'Đường: chi phí trung bình cho một lượt thành công của từng ngày. Cột đen: số lỗi phát sinh trong ngày.',
    read: 'Đường tăng nghĩa là ngày đó dùng nhiều tác vụ đắt (như video). Cột đen cao nghĩa là ngày đó nhiều lỗi, nên đối chiếu với đường chi phí.',
    note: 'Ngày không có lượt thành công thì đường bị ngắt.',
  },
  heatmap: {
    title: 'Nhịp sử dụng',
    what: 'Bản đồ nhiệt thể hiện số lượt thành công theo thứ trong tuần (hàng) và giờ trong ngày (cột).',
    read: 'Ô càng đậm thì giờ đó càng đông. Giúp biết khung giờ cao điểm để dự trù ngân sách hoặc hạn mức.',
    note: 'Giờ tính theo múi giờ Việt Nam.',
  },
  modelReliability: {
    title: 'Độ tin cậy theo mô hình',
    what: 'Tỷ lệ thành công của các mô hình được dùng nhiều nhất.',
    read: 'Thanh đầy là mô hình ổn định. Từ 90% trở lên là tốt, 70–90% cần theo dõi, dưới 70% là hay lỗi. Dòng nhỏ bên dưới cho biết số lượt thành công/tổng lượt và giá mỗi lượt.',
  },
  scatter: {
    title: 'Chi phí/lượt × tỷ lệ thành công',
    what: 'Mỗi bong bóng là một nhân viên. Kích thước theo số lượt dùng.',
    read: 'Trục ngang là chi phí mỗi lượt thành công (trái là rẻ hơn), trục dọc là tỷ lệ thành công (trên là ổn định hơn). Hai đường kẻ là mức trung bình của cả nhóm. Góc trên bên trái là rẻ và ổn định, góc dưới bên phải là đắt và hay lỗi. Bấm vào bong bóng để xem chi tiết người đó.',
    note: 'Chỉ hiện nhân viên có từ 5 yêu cầu trở lên để tránh kết luận từ mẫu quá nhỏ.',
  },
  speed: {
    title: 'Tốc độ xử lý',
    what: 'Thời gian từ lúc gửi đến lúc hoàn tất, theo từng loại tác vụ.',
    read: 'Thanh là thời gian trung bình. Vạch đen là P90: 90% yêu cầu xong trong khoảng thời gian đó, chỉ 10% chậm hơn. Vạch đen xa thanh nghĩa là thỉnh thoảng có lượt rất chậm.',
  },
  reasons: {
    title: 'Lý do lỗi phổ biến',
    what: 'Các lỗi được gom nhóm theo nội dung thông báo lỗi và xếp theo số lần xảy ra.',
    read: 'Thanh dài là nguyên nhân xảy ra nhiều lần hơn. Xử lý nhóm đứng đầu trước vì nó ảnh hưởng nhiều lượt nhất.',
  },
  score: {
    title: 'Điểm hiệu quả',
    what: 'Điểm 0–100 = 70% tỷ lệ thành công + 30% tỷ lệ không lặp prompt.',
    read: 'Điểm cao nghĩa là dùng AI ổn định và ít phải làm lại. Dùng để nhận ra ai cần được hướng dẫn thêm.',
    note: 'Chưa đo chất lượng đầu ra và chỉ xếp hạng nhân viên có từ 5 yêu cầu.',
  },
  empCost: {
    title: 'Chi tiêu của nhân viên',
    what: 'Tổng tiền nhân viên này đã dùng cho các yêu cầu AI thành công trong khoảng thời gian đang chọn.',
    read: 'Thanh màu bên cạnh chia khoản chi theo loại tác vụ. Đoạn dài hơn là loại tác vụ tốn nhiều tiền hơn, kèm tỷ lệ phần trăm của ba loại đầu.',
  },
  empVsTeamTag: {
    title: 'So với nhóm',
    what: 'Mức giá trung bình mỗi lượt thành công của nhân viên so với mức của cả nhóm, đã quy đổi theo cùng loại tác vụ.',
    read: 'Dấu + là đắt hơn nhóm, dấu − là rẻ hơn. Dấu "—" nghĩa là chưa đủ mẫu để so sánh.',
    note: 'Chỉ so khi cả nhân viên và nhóm đều có từ 5 yêu cầu ở loại tác vụ đó.',
  },
  empSuccess: {
    title: 'Tỷ lệ thành công',
    what: 'Số yêu cầu thành công chia cho tổng số yêu cầu đã kết thúc (thành công + lỗi) của nhân viên này.',
    read: 'Dòng nhỏ dưới thẻ cho biết số lượt thành công và số lỗi cụ thể. Dưới 80% là dấu hiệu nên xem lại cách dùng.',
  },
  empAvgPrice: {
    title: 'Giá trung bình',
    what: 'Tổng chi chia cho số yêu cầu thành công của nhân viên này.',
    read: 'Dòng nhỏ dưới thẻ cho biết cao hơn hay thấp hơn nhóm bao nhiêu phần trăm.',
    note: 'Giá thấp chưa chắc hiệu quả hơn vì dữ liệu không đo chất lượng đầu ra.',
  },
  empActiveDays: {
    title: 'Ngày hoạt động',
    what: 'Số ngày nhân viên có ít nhất một yêu cầu AI, trên tổng số ngày của khoảng đã chọn.',
    read: 'Ví dụ 12/30 nghĩa là dùng AI trong 12 ngày. Dòng nhỏ cho biết mức chi trung bình mỗi ngày có hoạt động.',
  },
  empLast: {
    title: 'Lần dùng gần nhất',
    what: 'Thời điểm nhân viên gửi yêu cầu AI gần đây nhất.',
    read: 'Dòng nhỏ cho biết tổng số token đã dùng, hoặc số yêu cầu trong kỳ nếu chưa có token.',
  },
  empDailyCost: {
    title: 'Chi phí theo ngày',
    what: 'Mỗi ngày một cột và một điểm trên đường.',
    read: 'Cột là số yêu cầu: màu nhạt là thành công, màu đen là lỗi. Đường là số tiền chi trong ngày. Ngày có cột cao nhưng đường thấp là nhiều việc rẻ, như chat.',
  },
  empDaily: {
    title: 'Hoạt động trong ngày',
    what: 'Mỗi chấm là một lần nhân viên gửi yêu cầu AI, đặt đúng giờ trong ngày, xếp theo loại tác vụ.',
    read: 'Chấm đỏ là yêu cầu lỗi. Thanh dài hơn là yêu cầu chạy lâu hơn. Rê chuột vào chấm để xem giờ, mô hình, trạng thái và chi phí. Cuộn chuột để phóng to khoảng giờ, kéo để di chuyển.',
  },
  empVsTeam: {
    title: 'So với nhóm theo loại tác vụ',
    what: 'Với mỗi loại tác vụ, so giá trung bình mỗi lượt thành công của nhân viên với mức trung bình của cả nhóm.',
    read: 'Thanh cam là nhân viên, thanh đen là nhóm. Nhãn bên phải là chênh lệch phần trăm. Dòng nhỏ cho biết tỷ trọng chi phí và số yêu cầu của loại đó.',
    note: 'Giá thấp chưa chắc hiệu quả hơn vì dữ liệu không đo chất lượng. Hiện "Mẫu nhỏ" khi dưới 5 yêu cầu.',
  },
  empModels: {
    title: 'Mô hình đã dùng',
    what: 'Các mô hình AI nhân viên đã dùng trong kỳ.',
    read: 'SL là số yêu cầu, Chi là tổng chi, TB là giá trung bình mỗi yêu cầu thành công, ± là chênh lệch so với giá nhóm cho cùng mô hình.',
  },
  empHistory: {
    title: 'Lịch sử yêu cầu',
    what: 'Từng yêu cầu AI gần đây của nhân viên, mới nhất ở trên cùng.',
    read: 'Biểu tượng trạng thái cho biết thành công, lỗi hay đang xử lý. Rê chuột vào biểu tượng lỗi để xem thông báo lỗi. Dùng bộ lọc để chỉ xem một trạng thái hoặc một loại tác vụ.',
  },
}

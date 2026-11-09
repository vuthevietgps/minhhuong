const form = document.querySelector("#pair");
const status = document.querySelector("#status");
const sync = document.querySelector("#sync");
const codeInput = form.elements.code;
const advanced = document.querySelector("#advanced");
const copySupport = document.querySelector("#copy-support");
const supportText = document.querySelector("#support-text");
const modeLabels = {
  WATCH: "Xem video rồi làm bài",
  LEARN_ONLY: "Chỉ học và làm bài",
  EXERCISE_ONLY: "Chỉ làm bài tập",
  PAUSED: "Đang tạm dừng",
};
let current = { paired: false };
function host(api) {
  try {
    return new URL(api).host;
  } catch {
    return "máy chủ";
  }
}
function friendlyError(error, api) {
  const message = String(error?.message || error || "");
  if (/invalid pairing|pairing|mã ghép/i.test(message))
    return "Mã kích hoạt không đúng hoặc đã hết hạn. Hãy tạo mã mới trên trang phụ huynh.";
  if (/timed? ?out|timeout|aborted/i.test(message))
    return "Máy chủ phản hồi quá chậm. Hãy thử lại sau ít phút.";
  if (/fetch|network|offline/i.test(message))
    return navigator.onLine
      ? `Không kết nối được tới ${host(api)}. Nếu Internet vẫn dùng bình thường, hãy bấm “Sao chép thông tin hỗ trợ” và gửi cho người hỗ trợ.`
      : "Máy đang mất mạng. Hãy kiểm tra Internet rồi thử lại.";
  return message || "Chưa kết nối được. Hãy thử lại hoặc nhờ người hỗ trợ.";
}
async function send(message) {
  const response = await chrome.runtime.sendMessage(message);
  if (!response.ok) throw new Error(response.error);
  return response.data;
}
function supportReport(state) {
  const time = (value) =>
    value ? new Date(value).toLocaleString("vi-VN") : "chưa có";
  const condition = !state.paired
    ? "Chưa kết nối"
    : state.revoked
      ? "Đã bị ngắt kết nối"
      : state.clockWarning
        ? "Ngày giờ trên máy chưa đúng"
        : "Đang hoạt động";
  return [
    "Thông tin hỗ trợ Minh Hương",
    `Phiên bản tiện ích: ${state.version || "không rõ"}`,
    `Trạng thái: ${condition}`,
    ...(state.paired
      ? [
          `Tên máy: ${state.deviceName || "không rõ"}`,
          `Hồ sơ của con: ${state.childName || "không rõ"}`,
          `Chế độ: ${modeLabels[state.mode] || state.mode || "không rõ"}`,
          `Máy chủ: ${state.api || "không rõ"}`,
          `Kiểm tra gần nhất: ${time(state.lastSync)}`,
          `Lỗi gần nhất: ${state.lastError || "không có"}`,
          `Sự kiện chờ gửi: ${state.pendingEvents ?? 0}`,
        ]
      : [`Máy chủ đang nhập: ${form.elements.api.value || "không rõ"}`]),
    `Giờ trên máy: ${new Date().toLocaleString("vi-VN")}`,
    `Mạng: ${navigator.onLine ? "có" : "không"}`,
    `Trình duyệt: ${navigator.userAgent}`,
  ].join("\n");
}
async function refresh() {
  const state = await send({ type: "STATUS" });
  current = state;
  document.querySelector("#version").textContent = state.version
    ? `Phiên bản ${state.version}`
    : "";
  // A revoked device can pair again with a new code from the parent.
  const canPair = !state.paired || state.revoked;
  form.hidden = !canPair;
  sync.hidden = !state.paired || state.revoked;
  // After the first pairing the server address is fixed in the extension.
  advanced.hidden = state.paired;
  if (state.paired) form.elements.api.value = state.api;
  document.querySelector("#step").hidden = state.paired && !state.revoked;
  document.querySelector("#title").textContent = !state.paired
    ? "Kết nối máy của con"
    : state.revoked
      ? "Kết nối lại máy của con"
      : "Máy của con đã kết nối";
  document.querySelector("#lead").textContent = !state.paired
    ? "Phụ huynh tạo mã kích hoạt trên trang quản lý trình duyệt, rồi nhập mã đó tại đây."
    : state.revoked
      ? "Máy này đã bị ngắt kết nối. Phụ huynh tạo mã kích hoạt mới trên trang quản lý trình duyệt rồi nhập vào đây để dùng lại."
      : "Máy sẽ tự nhận thay đổi của phụ huynh khoảng 30 giây một lần khi có mạng.";
  status.textContent = state.paired
    ? `${state.childName}\n${state.revoked ? "Máy này đã bị ngắt kết nối" : state.clockWarning ? "Ngày giờ trên máy chưa đúng. Hãy chỉnh lại ngày giờ rồi bấm Kiểm tra thay đổi" : "Đã sẵn sàng · " + (modeLabels[state.mode] || "Đang hoạt động")}\nKiểm tra gần nhất: ${state.lastSync ? new Date(state.lastSync).toLocaleString("vi-VN") : "chưa có"}${state.lastError && !state.revoked ? "\nChưa cập nhật được: " + friendlyError(state.lastError, state.api) : ""}`
    : "Nhập mã kích hoạt phụ huynh đã tạo rồi bấm Kết nối máy.";
}
codeInput.addEventListener("input", () => {
  codeInput.value = codeInput.value.replace(/[^a-fA-F0-9]/g, "").slice(0, 32);
});
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = form.querySelector("button");
  button.disabled = true;
  const values = Object.fromEntries(new FormData(form));
  const api = String(values.api || "http://localhost:4000").trim();
  try {
    await send({
      type: "PAIR",
      ...values,
      name: String(values.name || "").trim() || "Máy của con",
      api,
      code: String(values.code || "").trim().toLowerCase(),
    });
    codeInput.value = "";
    await refresh();
  } catch (error) {
    status.textContent = friendlyError(error, api);
  } finally {
    button.disabled = false;
  }
});
sync.addEventListener("click", async () => {
  sync.disabled = true;
  try {
    await send({ type: "SYNC" });
    await refresh();
  } catch (error) {
    status.textContent = friendlyError(error, current.api);
  } finally {
    sync.disabled = false;
  }
});
copySupport.addEventListener("click", async () => {
  const text = supportReport(current);
  supportText.value = text;
  try {
    await navigator.clipboard.writeText(text);
    supportText.hidden = true;
    status.textContent =
      "Đã sao chép thông tin hỗ trợ. Hãy dán vào tin nhắn gửi người hỗ trợ.";
  } catch {
    // Clipboard can be unavailable; show the text so it can be copied by hand.
    supportText.hidden = false;
    supportText.select();
    status.textContent = "Hãy chọn và sao chép nội dung bên dưới.";
  }
});
void refresh();

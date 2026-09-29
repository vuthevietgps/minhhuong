const form = document.querySelector("#pair");
const status = document.querySelector("#status");
const sync = document.querySelector("#sync");
const codeInput = form.elements.code;
const modeLabels = {
  WATCH: "Xem video rồi làm bài",
  LEARN_ONLY: "Chỉ học và làm bài",
  EXERCISE_ONLY: "Chỉ làm bài tập",
  PAUSED: "Đang tạm dừng",
};
function friendlyError(error) {
  const message = String(error?.message || error || "");
  if (/invalid pairing|pairing/i.test(message))
    return "Mã kích hoạt không đúng hoặc đã hết hạn. Hãy tạo mã mới trên trang phụ huynh.";
  if (/fetch|network|offline/i.test(message))
    return "Chưa kết nối được mạng. Hãy kiểm tra Internet rồi thử lại.";
  return message || "Chưa kết nối được. Hãy thử lại hoặc nhờ người hỗ trợ.";
}
async function send(message) {
  const response = await chrome.runtime.sendMessage(message);
  if (!response.ok) throw new Error(response.error);
  return response.data;
}
async function refresh() {
  const state = await send({ type: "STATUS" });
  form.hidden = state.paired;
  sync.hidden = !state.paired;
  status.textContent = state.paired
    ? `${state.childName}\n${state.revoked ? "Máy này đã bị ngắt kết nối" : state.clockWarning ? "Hãy kiểm tra ngày giờ trên máy rồi thử lại" : "Đã sẵn sàng · " + (modeLabels[state.mode] || "Đang hoạt động")}\nKiểm tra gần nhất: ${state.lastSync ? new Date(state.lastSync).toLocaleString("vi-VN") : "chưa có"}${state.lastError ? "\nChưa cập nhật được: " + friendlyError(state.lastError) : ""}`
    : "Nhập mã kích hoạt phụ huynh đã tạo rồi bấm Kết nối máy.";
}
codeInput.addEventListener("input", () => {
  codeInput.value = codeInput.value.replace(/[^a-fA-F0-9]/g, "").slice(0, 32);
});
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = form.querySelector("button");
  button.disabled = true;
  try {
    const values = Object.fromEntries(new FormData(form));
    await send({
      type: "PAIR",
      ...values,
      name: String(values.name || "").trim() || "Máy của con",
      api: String(values.api || "http://localhost:4000").trim(),
      code: String(values.code || "").trim().toLowerCase(),
    });
    await refresh();
  } catch (error) {
    status.textContent = friendlyError(error);
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
    status.textContent = friendlyError(error);
  } finally {
    sync.disabled = false;
  }
});
void refresh();

async function refresh() {
  const response = await chrome.runtime.sendMessage({ type: "STATUS" });
  const state = response?.data;
  const status = document.querySelector("#status");
  const items = document.querySelector("#items");
  items.replaceChildren();
  if (
    !state?.paired ||
    state.revoked ||
    state.clockWarning ||
    state.mode === "PAUSED"
  ) {
    status.textContent = !state?.paired
      ? "Nhờ bố mẹ kết nối máy bằng biểu tượng Minh Hương trên Chrome."
      : "Đang tạm dừng. Con hãy nhờ bố mẹ kiểm tra nhé.";
    return;
  }
  if (!state.items.length) {
    status.textContent = `Chào ${state.childName}! Bố mẹ chưa thêm nội dung nào.`;
    return;
  }
  const available = state.items.filter(
    (item) => item.status === "WATCH_AVAILABLE",
  );
  const timeUp = state.items.every((item) => item.status === "TIME_UP");
  const outsideWindow = state.items.every(
    (item) => item.status === "OUTSIDE_WINDOW",
  );
  const learnOnly = state.items.every((item) => item.status === "LEARN_ONLY");
  const exerciseOnly = state.items.every(
    (item) => item.status === "EXERCISE_ONLY",
  );
  status.textContent = timeUp
    ? "Đã hết thời gian xem hôm nay. Con chuyển sang hoạt động học nhé."
    : outsideWindow
      ? "Hiện chưa đến khung giờ xem. Con vẫn có thể học các nội dung bên dưới."
      : exerciseOnly
        ? "Hôm nay mình làm bài tập nhé."
        : learnOnly
          ? "Hôm nay mình tập trung vào hoạt động học nhé."
          : available.length
            ? `Chào ${state.childName}! Chọn nội dung đã được bố mẹ duyệt.`
            : `Chào ${state.childName}! Con có thể chọn hoạt động học bên dưới.`;
  for (const item of state.items) {
    const card = document.createElement("section");
    card.className = "card";
    const title = document.createElement("h2");
    title.textContent = item.title;
    card.append(title);
    const note = document.createElement("p");
    note.className = "item-status";
    note.textContent =
      item.status === "TIME_UP"
        ? "Link này đã hết thời gian xem hôm nay."
        : item.status === "OUTSIDE_WINDOW"
          ? "Ngoài khung giờ xem. Con vẫn có thể học."
          : item.status === "LEARN_ONLY"
            ? "Đang ở chế độ học."
            : item.status === "EXERCISE_ONLY"
              ? "Đang ở chế độ bài tập."
              : item.status === "WATCH_AVAILABLE"
                ? `Còn khoảng ${Math.max(1, Math.ceil(item.remainingSeconds / 60))} phút xem.`
                : "Nội dung này hiện chưa thể mở.";
    card.append(note);
    for (const [url, label] of [
      [item.watchUrl, "Xem nội dung"],
      [item.learningUrl, "Cùng học nào"],
    ]) {
      if (!url) continue;
      const link = document.createElement("a");
      link.className = "button";
      link.href = url;
      link.textContent = label;
      card.append(link);
    }
    items.append(card);
  }
}
document.querySelector("#refresh").addEventListener("click", async () => {
  await chrome.runtime.sendMessage({ type: "SYNC" });
  await refresh();
});
void refresh();

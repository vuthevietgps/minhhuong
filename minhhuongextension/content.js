(() => {
  let expiresAt = 0;
  let allowed = false;
  let checking = false;
  let expiryTimer;
  let lastUrl = location.href;
  const cover = document.createElement("div");
  const shadow = cover.attachShadow({ mode: "closed" });
  shadow.innerHTML =
    "<style>:host{position:fixed!important;inset:0!important;z-index:2147483647!important;display:grid!important;place-items:center!important;background:#f3f7f5!important;color:#194a3c!important;font:20px system-ui!important}</style><p>Minhhuong · Đang kiểm tra thời gian học…</p>";
  function lock() {
    if (document.documentElement && !cover.isConnected)
      document.documentElement.append(cover);
    document.querySelectorAll("video,audio").forEach((media) => media.pause());
  }
  async function check() {
    if (checking) return;
    checking = true;
    const requestedUrl = location.href;
    try {
      const response = await chrome.runtime.sendMessage({ type: "HEARTBEAT" });
      allowed =
        requestedUrl === location.href &&
        !!response?.ok &&
        !!response.data?.allowed;
      expiresAt = response?.data?.expiresAt || 0;
      clearTimeout(expiryTimer);
      if (allowed && expiresAt) {
        const remaining = expiresAt - Date.now();
        if (remaining <= 0) allowed = false;
        else
          expiryTimer = setTimeout(() => {
            allowed = false;
            lock();
            void check();
          }, remaining);
      }
      if (allowed) cover.remove();
      else lock();
    } catch {
      allowed = false;
      lock();
    } finally {
      checking = false;
    }
  }
  lock();
  new MutationObserver(() => {
    if (!allowed) lock();
  }).observe(document, { childList: true, subtree: true });
  document.addEventListener(
    "play",
    (event) => {
      if (!allowed || document.hidden) event.target.pause?.();
    },
    true,
  );
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      allowed = false;
      lock();
    } else void check();
  });
  setInterval(() => {
    if (lastUrl !== location.href) {
      lastUrl = location.href;
      allowed = false;
      lock();
    }
    if (expiresAt && Date.now() >= expiresAt) {
      allowed = false;
      lock();
    }
    void check();
  }, 1000);
  void check();
  // A narrow request bridge. The service worker validates the actual sender URL
  // and never returns device credentials or offers arbitrary fetch operations.
  window.addEventListener("message", async (event) => {
    if (
      event.source !== window ||
      event.origin !== location.origin ||
      event.data?.channel !== "minhhuong-learning-request"
    )
      return;
    const { id, action, body } = event.data;
    if (typeof id !== "string" || id.length > 80) return;
    try {
      const response = await chrome.runtime.sendMessage({
        type: "LEARNING",
        action,
        body,
      });
      window.postMessage(
        { channel: "minhhuong-learning-response", id, ...response },
        location.origin,
      );
    } catch {
      window.postMessage(
        {
          channel: "minhhuong-learning-response",
          id,
          ok: false,
          error: "Máy học chưa kết nối",
        },
        location.origin,
      );
    }
  });
})();

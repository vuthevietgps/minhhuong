"use client";

import { Download, Plus, Share, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const INSTALL_PROMPT_DISMISSED_AT = "minhhuong-pwa-install-dismissed-at";
const DISMISS_DURATION_MS = 1000 * 60 * 60 * 24 * 14;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isInstalled() {
  const navigatorWithStandalone = navigator as Navigator & {
    standalone?: boolean;
  };

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    navigatorWithStandalone.standalone === true
  );
}

function isIOSSafari() {
  const iosDevice =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const nonSafariBrowser = /CriOS|FxiOS|EdgiOS|OPiOS/.test(
    navigator.userAgent,
  );

  return iosDevice && !nonSafariBrowser;
}

export function PwaInstallPrompt() {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showIosInstructions, setShowIosInstructions] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const dismiss = () => {
    window.localStorage.setItem(
      INSTALL_PROMPT_DISMISSED_AT,
      String(Date.now()),
    );
    setIsVisible(false);
  };

  useEffect(() => {
    if (pathname === "/kid-learning") return;
    if (isInstalled()) return;

    const dismissedAt = Number(
      window.localStorage.getItem(INSTALL_PROMPT_DISMISSED_AT) ?? "0",
    );
    if (Date.now() - dismissedAt < DISMISS_DURATION_MS) return;

    if (isIOSSafari()) {
      setShowIosInstructions(true);
      setIsVisible(true);
      return;
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsVisible(false);
      window.localStorage.removeItem(INSTALL_PROMPT_DISMISSED_AT);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };

    if (isVisible) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible]);

  const install = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setIsVisible(false);

    if (outcome === "dismissed") {
      window.localStorage.setItem(
        INSTALL_PROMPT_DISMISSED_AT,
        String(Date.now()),
      );
    }
  };

  if (pathname === "/kid-learning" || !isVisible || (!showIosInstructions && !deferredPrompt)) {
    return null;
  }

  return (
    <div
      aria-describedby="pwa-install-description"
      aria-labelledby="pwa-install-title"
      aria-modal="true"
      className="pwa-install-backdrop"
      role="dialog"
    >
      <section className="pwa-install-card">
        <button
          aria-label="Đóng hướng dẫn cài ứng dụng"
          className="pwa-install-close"
          onClick={dismiss}
          type="button"
        >
          <X size={19} />
        </button>

        <div aria-hidden="true" className="pwa-install-icon">
          M
        </div>
        <div className="mt-4 pr-8">
          <p className="pwa-install-kicker">Học nhanh hơn mỗi ngày</p>
          <h2
            className="mt-1 text-xl font-extrabold text-slate-950"
            id="pwa-install-title"
          >
            Thêm Minh Hương vào màn hình chính
          </h2>
          <p
            className="mt-2 text-sm leading-6 text-slate-600"
            id="pwa-install-description"
          >
            Mở ứng dụng chỉ với một chạm, không cần tìm lại trên trình duyệt.
          </p>
        </div>

        {showIosInstructions ? (
          <ol className="pwa-install-steps">
            <li>
              <span className="pwa-install-step-number">1</span>
              <span>
                Chạm nút <Share aria-label="Chia sẻ" size={17} />{" "}
                <strong>Chia sẻ</strong> ở thanh Safari.
              </span>
            </li>
            <li>
              <span className="pwa-install-step-number">2</span>
              <span>
                Chọn <strong>Thêm vào Màn hình chính</strong>{" "}
                <Plus aria-hidden="true" size={17} />.
              </span>
            </li>
            <li>
              <span className="pwa-install-step-number">3</span>
              <span>
                Chạm <strong>Thêm</strong> để hoàn tất.
              </span>
            </li>
          </ol>
        ) : (
          <button
            className="pwa-install-primary"
            onClick={() => void install()}
            type="button"
          >
            <Download size={18} />
            Cài ứng dụng
          </button>
        )}

        <button className="pwa-install-later" onClick={dismiss} type="button">
          Để sau
        </button>
      </section>
    </div>
  );
}

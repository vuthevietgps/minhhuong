import { useEffect, useState } from "react";

export const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const apiErrorMessagesVi: Record<string, string> = {
  "Invalid or expired token": "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.",
  Unauthorized: "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.",
  Forbidden: "Bạn không có quyền thực hiện thao tác này.",
  "Access denied": "Bạn không có quyền truy cập.",
  "Not Found": "Không tìm thấy dữ liệu yêu cầu.",
  "Internal server error": "Máy chủ gặp lỗi. Vui lòng thử lại sau.",
};

function localizeApiError(message: string) {
  return apiErrorMessagesVi[message] ?? message;
}

export async function readApiError(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as { message?: unknown };
    if (Array.isArray(payload.message)) {
      return payload.message
        .map((message) => localizeApiError(String(message)))
        .join(" ");
    }

    if (typeof payload.message === "string") {
      return localizeApiError(payload.message);
    }

    if (payload.message && typeof payload.message === "object") {
      const detail = payload.message as { code?: string; message?: string };
      return localizeApiError(detail.message ?? detail.code ?? fallback);
    }

    return fallback;
  } catch {
    return fallback;
  }
}

export function useAuthenticatedUploadUrl(
  sourceUrl: string | undefined,
  accessToken: string,
  childProfileId?: string,
) {
  const [loadedUpload, setLoadedUpload] = useState<{
    sourceUrl: string;
    playbackUrl: string;
  }>();

  useEffect(() => {
    if (!sourceUrl?.startsWith("/uploads/")) return;

    const controller = new AbortController();
    let objectUrl: string | undefined;
    const requestUrl = new URL(`${apiBaseUrl}${sourceUrl}`);
    if (childProfileId) {
      requestUrl.searchParams.set("childProfileId", childProfileId);
    }

    void fetch(requestUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(
            await readApiError(response, "Bạn không có quyền xem video này."),
          );
        }
        return response.blob();
      })
      .then((blob) => {
        if (controller.signal.aborted) return;
        objectUrl = URL.createObjectURL(blob);
        setLoadedUpload({ sourceUrl, playbackUrl: objectUrl });
      })
      .catch(() => undefined);

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [accessToken, childProfileId, sourceUrl]);

  if (!sourceUrl) return undefined;
  if (!sourceUrl.startsWith("/uploads/")) {
    return sourceUrl.startsWith("http")
      ? sourceUrl
      : `${apiBaseUrl}${sourceUrl}`;
  }
  return loadedUpload?.sourceUrl === sourceUrl
    ? loadedUpload.playbackUrl
    : undefined;
}

export async function openAuthenticatedUpload(sourceUrl: string, accessToken: string) {
  const requestUrl = new URL(sourceUrl, apiBaseUrl);
  if (requestUrl.origin !== new URL(apiBaseUrl).origin) {
    throw new Error("Đường dẫn tệp bảo vệ nằm ngoài API đã cấu hình.");
  }
  const response = await fetch(requestUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    throw new Error(
      await readApiError(response, "Bạn không có quyền truy cập tệp này."),
    );
  }

  const objectUrl = URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = objectUrl;
  link.target = "_blank";
  link.rel = "noreferrer";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
}

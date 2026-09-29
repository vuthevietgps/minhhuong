import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background:
            "linear-gradient(145deg, #6558f5 0%, #826cfb 58%, #43c5b4 100%)",
          color: "#5a4bea",
          display: "flex",
          fontFamily: "sans-serif",
          height: "100%",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            alignItems: "center",
            background: "#ffffff",
            borderRadius: 42,
            boxShadow: "0 10px 28px rgba(40, 31, 126, 0.28)",
            display: "flex",
            fontSize: 78,
            fontWeight: 800,
            height: 112,
            justifyContent: "center",
            width: 112,
          }}
        >
          M
        </div>
      </div>
    ),
    size,
  );
}

import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background:
            "linear-gradient(145deg, #6558f5 0%, #826cfb 58%, #43c5b4 100%)",
          color: "white",
          display: "flex",
          fontFamily: "sans-serif",
          height: "100%",
          justifyContent: "center",
          position: "relative",
          width: "100%",
        }}
      >
        <div
          style={{
            background: "rgba(255, 255, 255, 0.16)",
            border: "18px solid rgba(255, 255, 255, 0.32)",
            borderRadius: "999px",
            display: "flex",
            height: 388,
            position: "absolute",
            right: -96,
            top: -118,
            width: 388,
          }}
        />
        <div
          style={{
            alignItems: "center",
            background: "#ffffff",
            borderRadius: 116,
            boxShadow: "0 28px 70px rgba(40, 31, 126, 0.28)",
            color: "#5a4bea",
            display: "flex",
            fontSize: 220,
            fontWeight: 800,
            height: 300,
            justifyContent: "center",
            lineHeight: 1,
            width: 300,
          }}
        >
          M
        </div>
        <div
          style={{
            alignItems: "center",
            background: "#ffbd66",
            borderRadius: "999px",
            bottom: 56,
            display: "flex",
            height: 82,
            justifyContent: "center",
            position: "absolute",
            right: 56,
            width: 82,
          }}
        />
      </div>
    ),
    size,
  );
}

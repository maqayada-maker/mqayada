import React, { useState, useEffect, useRef } from "react";
import img_1 from "./assets/images/image_6.png";
import img_bg from "./assets/images/image_7.png";
const Slide11: React.FC = () => {
  const outerRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState({
    s: 1,
    x: 0,
    y: 0
  });
  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const s = Math.min(w / 960, h / 540);
      setLayout({
        s,
        x: (w - 960 * s) / 2,
        y: (h - 540 * s) / 2
      });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return <div id="slide-11" ref={outerRef} className="w-screen h-screen overflow-hidden relative" style={{
    backgroundColor: "#000"
  }}><div id="slide-inner-11" style={{
      position: "absolute",
      width: "960px",
      height: "540px",
      overflow: "hidden",
      transformOrigin: "top left",
      color: "#000000",
      backgroundImage: `url(${img_bg})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      transform: `scale(${layout.s})`,
      left: layout.x + "px",
      top: layout.y + "px"
    }}><img key={0} src={img_1} alt="Google Shape;214;p23" style={{
        position: "absolute",
        left: "31.19px",
        top: "18.7px",
        width: "87.06px",
        height: "87.06px",
        boxSizing: "border-box",
        objectFit: "fill"
      }} /><div key={1} style={{
        position: "absolute",
        left: "516.16px",
        top: "103.86px",
        width: "371.78px",
        height: "99.75px",
        boxSizing: "border-box",
        backgroundColor: "transparent",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "9.6px 9.6px 9.6px 9.6px",
        wordWrap: "break-word"
      }}><p style={{
          textAlign: "right",
          lineHeight: "1.38",
          fontSize: "calc(28pt * var(--pptx-font-scale, 1))",
          marginTop: "0",
          marginBottom: "0"
        }}><span style={{
            fontSize: "calc(28pt * var(--pptx-font-scale, 1))",
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            fontWeight: "700",
            color: "#032341"
          }}>{"\u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631/\u0627\u0644\u062A\u062D\u0642\u0642:"}</span></p></div><div key={2} style={{
        position: "absolute",
        left: "179.87px",
        top: "199.27px",
        width: "745.32px",
        height: "99.75px",
        boxSizing: "border-box",
        backgroundColor: "transparent",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "9.6px 9.6px 9.6px 9.6px",
        wordWrap: "break-word"
      }}><p style={{
          textAlign: "justify",
          lineHeight: "1.38",
          paddingLeft: "48px",
          fontSize: "calc(16pt * var(--pptx-font-scale, 1))",
          marginTop: "0",
          marginBottom: "0"
        }}><span style={{
            fontSize: "calc(16pt * var(--pptx-font-scale, 1))",
            fontFamily: "'IBM Plex Sans Arabic Medium', 'IBM Plex Sans Arabic', sans-serif",
            fontWeight: "500",
            color: "#C36B4E"
          }}>{"\u0645\u0627 \u0647\u064A \u0627\u0644\u0646\u062A\u0627\u0626\u062C \u0627\u0644\u0623\u0648\u0644\u064A\u0629 \u0623\u0648 \u0627\u0644\u0646\u0645\u0627\u0630\u062C \u0627\u0644\u0623\u0648\u0644\u064A\u0629 \u0627\u0644\u062A\u064A \u0642\u0645\u062A \u0628\u062A\u0637\u0648\u064A\u0631\u0647\u0627\u061F "}</span><span style={{
            fontSize: "calc(16pt * var(--pptx-font-scale, 1))",
            fontFamily: "'IBM Plex Sans Arabic Medium', 'IBM Plex Sans Arabic', sans-serif",
            fontWeight: "500",
            color: "#8980BC"
          }}>{"(\u0639\u0644\u0649 \u0633\u0628\u064A\u0644 \u0627\u0644\u0645\u062B\u0627\u0644\u060C \"\u0642\u0645\u0646\u0627 \u0628\u0627\u062E\u062A\u0628\u0627\u0631 \u0646\u0645\u0648\u0630\u062C \u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0648\u0636\u0639\u064A\u0627\u062A \u0639\u0644\u0649 50 \u0645\u0642\u0637\u0639 \u0641\u064A\u062F\u064A\u0648 \u062A\u062C\u0631\u064A\u0628\u064A\")"}</span><span style={{
            fontSize: "calc(16pt * var(--pptx-font-scale, 1))",
            fontFamily: "'IBM Plex Sans Arabic Medium', 'IBM Plex Sans Arabic', sans-serif",
            fontWeight: "500",
            color: "#C36B4E"
          }}>{"."}</span></p><p style={{
          textAlign: "justify",
          lineHeight: "1.38",
          marginTop: "12pt",
          fontSize: "calc(10pt * var(--pptx-font-scale, 1))",
          marginBottom: "0"
        }}><span style={{
            fontSize: "calc(10pt * var(--pptx-font-scale, 1))"
          }}>{"\xA0"}</span></p></div></div></div>;
};
export default Slide11;

import React, { useState, useEffect, useRef } from "react";
import img_1 from "./assets/images/image_5.png";
import img_2 from "./assets/images/image_6.png";
import img_bg from "./assets/images/image_7.png";
const Slide2: React.FC = () => {
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
  return <div id="slide-2" ref={outerRef} className="w-screen h-screen overflow-hidden relative" style={{
    backgroundColor: "#000"
  }}><div id="slide-inner-2" style={{
      position: "absolute",
      width: "960px",
      height: "540px",
      overflow: "hidden",
      transformOrigin: "top left",
      color: "#000000",
      direction: "rtl",
      backgroundImage: `url(${img_bg})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      transform: `scale(${layout.s})`,
      left: layout.x + "px",
      top: layout.y + "px"
    }}><div key={0} style={{
        position: "absolute",
        left: "75.59px",
        top: "118.73px",
        width: "808.82px",
        height: "60.13px",
        boxSizing: "border-box",
        backgroundColor: "transparent",
        padding: "9.6px 9.6px 9.6px 9.6px",
        wordWrap: "break-word"
      }}><p style={{
          textAlign: "center",
          lineHeight: "1.2",
          fontSize: "calc(28pt * var(--pptx-font-scale, 1))",
          marginTop: "0",
          marginBottom: "0"
        }}><span style={{
            fontSize: "calc(28pt * var(--pptx-font-scale, 1))",
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            fontWeight: "700",
            color: "#C36B4E"
          }}>{"أعضاء الفريق"}</span></p></div><div key={1} style={{
        position: "absolute",
        left: "425.15px",
        top: "210.77px",
        width: "109.7px",
        height: "109.7px",
        boxSizing: "border-box",
        backgroundColor: "#032341",
        border: "1px solid #C36B4E",
        borderRadius: "50%"
      }} /><img key={2} src={img_1} alt="أيقونة العضو" style={{
        position: "absolute",
        left: "453.04px",
        top: "238.66px",
        width: "53.92px",
        height: "53.92px",
        boxSizing: "border-box",
        objectFit: "fill"
      }} /><div key={3} style={{
        position: "absolute",
        left: "280px",
        top: "340px",
        width: "400px",
        height: "90px",
        boxSizing: "border-box",
        backgroundColor: "transparent",
        padding: "9.6px 9.6px 9.6px 9.6px",
        wordWrap: "break-word"
      }}><p style={{
          textAlign: "center",
          lineHeight: "1.5",
          fontSize: "calc(17pt * var(--pptx-font-scale, 1))",
          marginTop: "0",
          marginBottom: "0"
        }}><span style={{
            fontSize: "calc(17pt * var(--pptx-font-scale, 1))",
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            fontWeight: "700",
            color: "#032341"
          }}>{"عبدالله محمد الغامدي"}</span></p><p style={{
          textAlign: "center",
          lineHeight: "1.5",
          fontSize: "calc(14pt * var(--pptx-font-scale, 1))",
          marginTop: "0",
          marginBottom: "0"
        }}><span style={{
            fontSize: "calc(14pt * var(--pptx-font-scale, 1))",
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            color: "#C36B4E"
          }}>{"قائد الفريق"}</span></p></div><img key={4} src={img_2} alt="شعار الهاكاثون" style={{
        position: "absolute",
        left: "31.19px",
        top: "18.7px",
        width: "87.06px",
        height: "87.06px",
        boxSizing: "border-box",
        objectFit: "fill"
      }} /></div></div>;
};
export default Slide2;

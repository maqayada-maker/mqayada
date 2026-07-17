import React, { useState, useEffect, useRef } from "react";
import img_1 from "./assets/images/image_1.png";
import img_2 from "./assets/images/image_2.png";
import img_3 from "./assets/images/image_3.png";
import img_bg from "./assets/images/image_4.png";
const Slide1: React.FC = () => {
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
  return <div id="slide-1" ref={outerRef} className="w-screen h-screen overflow-hidden relative" style={{
    backgroundColor: "#000"
  }}><div id="slide-inner-1" style={{
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
    }}><div key={0} style={{
        position: "absolute",
        left: "90.66px",
        top: "267.41px",
        width: "778.68px",
        height: "56.31px",
        boxSizing: "border-box",
        backgroundColor: "transparent",
        padding: "9.6px 9.6px 9.6px 9.6px",
        wordWrap: "break-word"
      }}><p style={{
          textAlign: "center",
          lineHeight: "1.2",
          fontSize: "calc(32.2pt * var(--pptx-font-scale, 1))",
          marginTop: "0",
          marginBottom: "0"
        }}><span style={{
            fontSize: "calc(32.2pt * var(--pptx-font-scale, 1))",
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            fontWeight: "700",
            color: "#F6E7DC"
          }}>{"\u0627\u0633\u0645 \u0627\u0644\u0645\u0634\u0631\u0648\u0639"}</span></p></div><div key={1} style={{
        position: "absolute",
        left: "90.66px",
        top: "335.01px",
        width: "778.68px",
        height: "56.31px",
        boxSizing: "border-box",
        backgroundColor: "transparent",
        padding: "9.6px 9.6px 9.6px 9.6px",
        ["--pptx-font-scale"]: "0.828",
        wordWrap: "break-word"
      }}><p style={{
          textAlign: "center",
          lineHeight: "0.96",
          fontSize: "calc(28pt * var(--pptx-font-scale, 1))",
          marginTop: "0",
          marginBottom: "0"
        }}><span style={{
            fontSize: "calc(28pt * var(--pptx-font-scale, 1))",
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            color: "#F6E7DC"
          }}>{"\u0627\u0633\u0645 \u0627\u0644\u0641\u0631\u064A\u0642"}</span></p></div><img key={2} src={img_1} alt="Google Shape;52;p13" style={{
        position: "absolute",
        left: "378.3px",
        top: "92.47px",
        width: "203.4px",
        height: "124.42px",
        boxSizing: "border-box",
        objectFit: "fill"
      }} /><img key={3} src={img_2} alt="Google Shape;53;p13" style={{
        position: "absolute",
        left: "762.02px",
        top: "478.57px",
        width: "169.34px",
        height: "33.15px",
        boxSizing: "border-box",
        objectFit: "fill"
      }} /><img key={4} src={img_3} alt="Google Shape;54;p13" style={{
        position: "absolute",
        left: "29.36px",
        top: "474.78px",
        width: "107.4px",
        height: "40.75px",
        boxSizing: "border-box",
        objectFit: "fill"
      }} /></div></div>;
};
export default Slide1;

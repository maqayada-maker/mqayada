import React, { useState, useEffect, useRef } from "react";
import img_1 from "./assets/images/image_6.png";
import img_2 from "./assets/images/image_17.jpg";
import img_bg from "./assets/images/image_7.png";
const Slide10: React.FC = () => {
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
  return <div id="slide-10" ref={outerRef} className="w-screen h-screen overflow-hidden relative" style={{
    backgroundColor: "#000"
  }}><div id="slide-inner-10" style={{
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
    }}><img key={0} src={img_1} alt="Google Shape;206;p22" style={{
        position: "absolute",
        left: "31.19px",
        top: "18.7px",
        width: "87.06px",
        height: "87.06px",
        boxSizing: "border-box",
        objectFit: "fill"
      }} /><div key={1} style={{
        position: "absolute",
        left: "652.3px",
        top: "0px",
        width: "307.7px",
        height: "540px",
        boxSizing: "border-box",
        overflow: "hidden"
      }}><img src={img_2} alt="Google Shape;207;p22" style={{
          position: "absolute",
          left: "-194.59px",
          top: "0px",
          width: "810.21px",
          height: "540px",
          maxWidth: "none"
        }} /></div><div key={2} style={{
        position: "absolute",
        left: "225.79px",
        top: "162.86px",
        width: "369.04px",
        height: "56.31px",
        boxSizing: "border-box",
        backgroundColor: "transparent",
        padding: "9.6px 9.6px 9.6px 9.6px",
        wordWrap: "break-word"
      }}><p style={{
          textAlign: "right",
          lineHeight: "1.2",
          fontSize: "calc(28pt * var(--pptx-font-scale, 1))",
          marginTop: "0",
          marginBottom: "0"
        }}><span style={{
            fontSize: "calc(28pt * var(--pptx-font-scale, 1))",
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            fontWeight: "700",
            color: "#032341"
          }}>{"\u0645\u0644\u062E\u0635"}</span></p></div><div key={3} style={{
        position: "absolute",
        left: "204.36px",
        top: "232.57px",
        width: "390.46px",
        height: "144.57px",
        boxSizing: "border-box",
        backgroundColor: "transparent",
        padding: "9.6px 9.6px 9.6px 9.6px",
        wordWrap: "break-word"
      }}><p style={{
          textAlign: "right",
          lineHeight: "1.38",
          fontSize: "calc(14pt * var(--pptx-font-scale, 1))",
          marginTop: "0",
          marginBottom: "0"
        }}><span style={{
            fontSize: "calc(14pt * var(--pptx-font-scale, 1))",
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            color: "#C36B4E"
          }}>{"\u064A\u0642\u062F\u0645 \u0647\u0630\u0627 \u0627\u0644\u0642\u0633\u0645 \u0644\u0645\u062D\u0629 \u0639\u0627\u0645\u0629 \u0639\u0646 \u0627\u0644\u0645\u0634\u0631\u0648\u0639 \u0628\u0634\u0643\u0644 \u0634\u0627\u0645\u0644\u060C \u0628\u0645\u0627 \u0641\u064A \u0630\u0644\u0643 \u0623\u0647\u062F\u0627\u0641\u0647\u060C \u0645\u062E\u0631\u062C\u0627\u062A\u0647\u060C \u0648\u0623\u0647\u0645 \u0627\u0644\u0646\u062A\u0627\u0626\u062C \u0627\u0644\u062A\u064A \u062A\u0645 \u0627\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u064A\u0647\u0627."}</span></p></div></div></div>;
};
export default Slide10;

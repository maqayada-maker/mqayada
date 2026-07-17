import React, { useState, useEffect, useRef } from "react";
import img_1 from "./assets/images/image_6.png";
import img_2 from "./assets/images/image_17.jpg";
import img_bg from "./assets/images/image_7.png";
const Slide9: React.FC = () => {
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
  return <div id="slide-9" ref={outerRef} className="w-screen h-screen overflow-hidden relative" style={{
    backgroundColor: "#000"
  }}><div id="slide-inner-9" style={{
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
    }}><img key={0} src={img_1} alt="Google Shape;198;p21" style={{
        position: "absolute",
        left: "31.19px",
        top: "18.7px",
        width: "87.06px",
        height: "87.06px",
        boxSizing: "border-box",
        objectFit: "fill"
      }} /><div key={1} style={{
        position: "absolute",
        left: "236.16px",
        top: "151.46px",
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
          }}>{"\u0645\u0648\u0627\u0621\u0645\u0629 \u0627\u0644\u0641\u0643\u0631\u0629 :"}</span></p></div><div key={2} style={{
        position: "absolute",
        left: "214.73px",
        top: "221.17px",
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
          }}>{"\u0635\u0641 \u0643\u064A\u0641 \u062A\u062A\u0645\u0627\u0634\u0649 \u0627\u0644\u0641\u0643\u0631\u0629 \u0645\u0639 \u0645\u0648\u0636\u0648\u0639 \u0627\u0644\u0645\u0633\u0627\u0628\u0642\u0629 (\u0639\u0644\u0649 \u0633\u0628\u064A\u0644 \u0627\u0644\u0645\u062B\u0627\u0644\u060C \u0648\u0644\u064A\u0633 \u0639\u0644\u0649 \u0633\u0628\u064A\u0644 \u0627\u0644\u062D\u0635\u0631: \u062A\u062D\u0633\u064A\u0646 \u0627\u0644\u0623\u062F\u0627\u0621\u060C \u062A\u0639\u0632\u064A\u0632 \u0627\u0644\u0633\u0644\u0627\u0645\u0629\u060C \u0623\u0648 \u062A\u062D\u0633\u064A\u0646 \u062A\u0641\u0627\u0639\u0644 \u0627\u0644\u0645\u0634\u062C\u0639\u064A\u0646)."}</span></p></div><div key={3} style={{
        position: "absolute",
        left: "652.3px",
        top: "0px",
        width: "307.7px",
        height: "540px",
        boxSizing: "border-box",
        overflow: "hidden"
      }}><img src={img_2} alt="Google Shape;201;p21" style={{
          position: "absolute",
          left: "-194.59px",
          top: "0px",
          width: "810.21px",
          height: "540px",
          maxWidth: "none"
        }} /></div></div></div>;
};
export default Slide9;

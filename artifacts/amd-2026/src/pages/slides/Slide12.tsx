import React, { useState, useEffect, useRef } from "react";
import img_1 from "./assets/images/image_6.png";
import img_bg from "./assets/images/image_7.png";
import shot_landing from "./assets/images/shot_landing.jpg";
import shot_register from "./assets/images/shot_register.jpg";
import shot_login from "./assets/images/shot_login.jpg";
const shotStyle: React.CSSProperties = {
  position: "absolute",
  top: "232px",
  width: "280px",
  height: "157.5px",
  boxSizing: "border-box",
  objectFit: "cover",
  border: "1px solid rgba(3, 35, 65, 0.3)",
  borderRadius: "8px",
  boxShadow: "0 4px 12px rgba(3, 35, 65, 0.18)",
  backgroundColor: "#ffffff"
};
const captionBoxStyle: React.CSSProperties = {
  position: "absolute",
  top: "394px",
  width: "280px",
  height: "24px",
  boxSizing: "border-box",
  backgroundColor: "transparent",
  wordWrap: "break-word"
};
const captionPStyle: React.CSSProperties = {
  textAlign: "center",
  lineHeight: "1.3",
  fontSize: "calc(11pt * var(--pptx-font-scale, 1))",
  marginTop: "0",
  marginBottom: "0"
};
const captionSpanStyle: React.CSSProperties = {
  fontSize: "calc(11pt * var(--pptx-font-scale, 1))",
  fontFamily: "'IBM Plex Sans Arabic', sans-serif",
  fontWeight: "600",
  color: "#032341"
};
const Slide12: React.FC = () => {
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
  return <div id="slide-12" ref={outerRef} className="w-screen h-screen overflow-hidden relative" style={{
    backgroundColor: "#000"
  }}><div id="slide-inner-12" style={{
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
    }}><img key={0} src={img_1} alt="Google Shape;221;p24" style={{
        position: "absolute",
        left: "31.19px",
        top: "18.7px",
        width: "87.06px",
        height: "87.06px",
        boxSizing: "border-box",
        objectFit: "fill"
      }} /><div key={1} style={{
        position: "absolute",
        left: "219.87px",
        top: "103.86px",
        width: "668.06px",
        height: "125.61px",
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
          }}>{"العرض التوضيحي: لقطات من داخل المنصة"}</span></p></div><img key={2} src={shot_landing} alt="الصفحة الرئيسية لمنصة مقايضة" style={{
        ...shotStyle,
        left: "640px"
      }} /><img key={3} src={shot_register} alt="صفحة إنشاء حساب جديد" style={{
        ...shotStyle,
        left: "340px"
      }} /><img key={4} src={shot_login} alt="صفحة تسجيل الدخول" style={{
        ...shotStyle,
        left: "40px"
      }} /><div key={5} style={{
        ...captionBoxStyle,
        left: "640px"
      }}><p style={captionPStyle}><span style={captionSpanStyle}>{"الصفحة الرئيسية"}</span></p></div><div key={6} style={{
        ...captionBoxStyle,
        left: "340px"
      }}><p style={captionPStyle}><span style={captionSpanStyle}>{"إنشاء حساب جديد"}</span></p></div><div key={7} style={{
        ...captionBoxStyle,
        left: "40px"
      }}><p style={captionPStyle}><span style={captionSpanStyle}>{"تسجيل الدخول"}</span></p></div><div key={8} style={{
        position: "absolute",
        left: "131.71px",
        top: "428px",
        width: "696.22px",
        height: "80px",
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
          fontSize: "calc(13pt * var(--pptx-font-scale, 1))",
          marginTop: "0",
          marginBottom: "0"
        }}><span style={{
            fontSize: "calc(13pt * var(--pptx-font-scale, 1))",
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            color: "#C36B4E"
          }}>{"نموذجٌ أوّلي عامل يشمل بوابات العميل والمستشار والمشرف ولوحة الإدارة، إضافةً إلى حاسبة تمويلٍ تفاعلية ومساعدٍ مالي ذكي."}</span></p></div></div></div>;
};
export default Slide12;

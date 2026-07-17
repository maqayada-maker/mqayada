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
          }}>{"\u0623\u0639\u0636\u0627\u0621 \u0627\u0644\u0641\u0631\u064A\u0642"}</span></p></div><div key={1} style={{
        position: "absolute",
        left: "517.27px",
        top: "210.77px",
        width: "109.7px",
        height: "109.7px",
        boxSizing: "border-box",
        backgroundColor: "#032341",
        border: "1px solid #C36B4E",
        borderRadius: "50%"
      }} /><div key={2} style={{
        position: "absolute",
        left: "681.98px",
        top: "210.77px",
        width: "109.7px",
        height: "109.7px",
        boxSizing: "border-box",
        backgroundColor: "#032341",
        border: "1px solid #C36B4E",
        borderRadius: "50%"
      }} /><div key={3} style={{
        position: "absolute",
        left: "642.75px",
        top: "335.47px",
        width: "172.03px",
        height: "65.76px",
        boxSizing: "border-box",
        backgroundColor: "transparent",
        padding: "9.6px 9.6px 9.6px 9.6px",
        wordWrap: "break-word"
      }}><p style={{
          textAlign: "center",
          lineHeight: "2.4",
          fontSize: "calc(14pt * var(--pptx-font-scale, 1))",
          marginTop: "0",
          marginBottom: "0"
        }}><span style={{
            fontSize: "calc(14pt * var(--pptx-font-scale, 1))",
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            color: "#C36B4E"
          }}>{"\u0627\u0633\u0645 \u0627\u0644\u0639\u0636\u0648"}</span></p></div><div key={4} style={{
        position: "absolute",
        left: "485.43px",
        top: "335.47px",
        width: "172.03px",
        height: "65.76px",
        boxSizing: "border-box",
        backgroundColor: "transparent",
        padding: "9.6px 9.6px 9.6px 9.6px",
        wordWrap: "break-word"
      }}><p style={{
          textAlign: "center",
          lineHeight: "2.4",
          fontSize: "calc(14pt * var(--pptx-font-scale, 1))",
          marginTop: "0",
          marginBottom: "0"
        }}><span style={{
            fontSize: "calc(14pt * var(--pptx-font-scale, 1))",
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            color: "#C36B4E"
          }}>{"\u0627\u0633\u0645 \u0627\u0644\u0639\u0636\u0648"}</span></p></div><div key={5} style={{
        position: "absolute",
        left: "315.66px",
        top: "335.47px",
        width: "172.03px",
        height: "65.76px",
        boxSizing: "border-box",
        backgroundColor: "transparent",
        padding: "9.6px 9.6px 9.6px 9.6px",
        wordWrap: "break-word"
      }}><p style={{
          textAlign: "center",
          lineHeight: "2.4",
          fontSize: "calc(14pt * var(--pptx-font-scale, 1))",
          marginTop: "0",
          marginBottom: "0"
        }}><span style={{
            fontSize: "calc(14pt * var(--pptx-font-scale, 1))",
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            color: "#C36B4E"
          }}>{"\u0627\u0633\u0645 \u0627\u0644\u0639\u0636\u0648"}</span></p></div><div key={6} style={{
        position: "absolute",
        left: "145.22px",
        top: "335.47px",
        width: "172.03px",
        height: "65.76px",
        boxSizing: "border-box",
        backgroundColor: "transparent",
        padding: "9.6px 9.6px 9.6px 9.6px",
        wordWrap: "break-word"
      }}><p style={{
          textAlign: "center",
          lineHeight: "2.4",
          fontSize: "calc(14pt * var(--pptx-font-scale, 1))",
          marginTop: "0",
          marginBottom: "0"
        }}><span style={{
            fontSize: "calc(14pt * var(--pptx-font-scale, 1))",
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            color: "#C36B4E"
          }}>{"\u0627\u0633\u0645 \u0627\u0644\u0639\u0636\u0648"}</span></p></div><div key={7} style={{
        position: "absolute",
        left: "176.39px",
        top: "210.77px",
        width: "109.7px",
        height: "109.7px",
        boxSizing: "border-box",
        backgroundColor: "#032341",
        border: "1px solid #C36B4E",
        borderRadius: "50%"
      }} /><div key={8} style={{
        position: "absolute",
        left: "346.83px",
        top: "210.77px",
        width: "109.7px",
        height: "109.7px",
        boxSizing: "border-box",
        backgroundColor: "#032341",
        border: "1px solid #C36B4E",
        borderRadius: "50%"
      }} /><img key={9} src={img_1} alt="Google Shape;68;p14" style={{
        position: "absolute",
        left: "204.28px",
        top: "238.66px",
        width: "53.92px",
        height: "53.92px",
        boxSizing: "border-box",
        objectFit: "fill"
      }} /><img key={10} src={img_1} alt="Google Shape;69;p14" style={{
        position: "absolute",
        left: "374.72px",
        top: "238.66px",
        width: "53.92px",
        height: "53.92px",
        boxSizing: "border-box",
        objectFit: "fill"
      }} /><img key={11} src={img_1} alt="Google Shape;70;p14" style={{
        position: "absolute",
        left: "545.16px",
        top: "238.66px",
        width: "53.92px",
        height: "53.92px",
        boxSizing: "border-box",
        objectFit: "fill"
      }} /><img key={12} src={img_1} alt="Google Shape;71;p14" style={{
        position: "absolute",
        left: "709.87px",
        top: "238.66px",
        width: "53.92px",
        height: "53.92px",
        boxSizing: "border-box",
        objectFit: "fill"
      }} /><img key={13} src={img_2} alt="Google Shape;72;p14" style={{
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

import React, { useState, useEffect, useRef } from "react";
import img_1 from "./assets/images/image_6.png";
import img_2 from "./assets/images/image_18.png";
import img_bg from "./assets/images/image_7.png";
const Slide13: React.FC = () => {
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
  return <div id="slide-13" ref={outerRef} className="w-screen h-screen overflow-hidden relative" style={{
    backgroundColor: "#000"
  }}><div id="slide-inner-13" style={{
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
    }}><img key={0} src={img_1} alt="Google Shape;228;p25" style={{
        position: "absolute",
        left: "31.19px",
        top: "18.7px",
        width: "87.06px",
        height: "87.06px",
        boxSizing: "border-box",
        objectFit: "fill"
      }} /><div key={1} style={{
        position: "absolute",
        left: "380.03px",
        top: "103.86px",
        width: "507.91px",
        height: "63.09px",
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
          }}>{"\u0627\u0644\u062A\u062D\u062F\u064A\u0627\u062A \u0648\u0627\u0644\u062E\u0637\u0637 \u0627\u0644\u0645\u0633\u062A\u0642\u0628\u0644\u064A\u0629"}</span></p></div><div key={2} style={{
        position: "absolute",
        left: "208.34px",
        top: "188.16px",
        width: "322.47px",
        height: "130.43px"
      }}><div key={0} style={{
          position: "absolute",
          left: "0px",
          top: "7.83px",
          width: "291.09px",
          height: "112.6px",
          boxSizing: "border-box",
          backgroundColor: "transparent",
          padding: "9.6px 9.6px 9.6px 9.6px",
          wordWrap: "break-word"
        }}><p style={{
            textAlign: "right",
            lineHeight: "1.2",
            fontSize: "calc(16pt * var(--pptx-font-scale, 1))",
            marginTop: "0",
            marginBottom: "0"
          }}><span style={{
              fontSize: "calc(16pt * var(--pptx-font-scale, 1))",
              fontFamily: "'IBM Plex Sans Arabic Medium', 'IBM Plex Sans Arabic', sans-serif",
              fontWeight: "500",
              color: "#8980BC"
            }}>{"\u0645\u0627 \u062A\u062D\u062A\u0627\u062C \u0625\u0644\u0649 \u0645\u0633\u0627\u0639\u062F\u0629 \u0641\u064A\u0647:"}</span></p><p style={{
            textAlign: "justify",
            lineHeight: "1.38",
            marginTop: "12pt",
            fontSize: "calc(11pt * var(--pptx-font-scale, 1))",
            marginBottom: "0"
          }}><span style={{
              fontSize: "calc(11pt * var(--pptx-font-scale, 1))",
              fontFamily: "'IBM Plex Sans Arabic', sans-serif",
              color: "#C36B4E"
            }}>{" \u0643\u064A\u0641 \u064A\u0645\u0643\u0646 \u0644\u0644\u0645\u0646\u0638\u0645\u064A\u0646 \u0623\u0648 \u0627\u0644\u0645\u0631\u0634\u062F\u064A\u0646 \u0645\u0633\u0627\u0639\u062F\u062A\u0643\u061F (\u0645\u062B\u0644 \u062A\u0648\u0641\u064A\u0631 \u0627\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0648\u0627\u062C\u0647\u0627\u062A \u0628\u0631\u0645\u062C\u064A\u0629 API \u0623\u0648 \u0627\u0644\u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629)."}</span></p></div><img key={1} src={img_2} alt="Google Shape;232;p25" style={{
          position: "absolute",
          left: "192.04px",
          top: "0px",
          width: "130.43px",
          height: "130.43px",
          boxSizing: "border-box",
          objectFit: "fill"
        }} /></div><div key={3} style={{
        position: "absolute",
        left: "613.69px",
        top: "188.16px",
        width: "259.65px",
        height: "130.43px"
      }}><div key={0} style={{
          position: "absolute",
          left: "0px",
          top: "11.32px",
          width: "235.65px",
          height: "107.78px",
          boxSizing: "border-box",
          backgroundColor: "transparent",
          padding: "9.6px 9.6px 9.6px 9.6px",
          wordWrap: "break-word"
        }}><p style={{
            textAlign: "justify",
            lineHeight: "1.38",
            fontSize: "calc(16pt * var(--pptx-font-scale, 1))",
            marginTop: "0",
            marginBottom: "0"
          }}><span style={{
              fontSize: "calc(16pt * var(--pptx-font-scale, 1))",
              fontFamily: "'IBM Plex Sans Arabic Medium', 'IBM Plex Sans Arabic', sans-serif",
              fontWeight: "500",
              color: "#8980BC"
            }}>{"\u0627\u0644\u062A\u062D\u062F\u064A\u0627\u062A:"}</span><br /><span style={{
              fontSize: "calc(11pt * var(--pptx-font-scale, 1))",
              fontFamily: "'IBM Plex Sans Arabic', sans-serif",
              color: "#C36B4E"
            }}>{" \u0645\u0627 \u0647\u064A \u0627\u0644\u0639\u0648\u0627\u0626\u0642 \u0627\u0644\u062A\u064A \u062A\u0648\u0627\u062C\u0647\u0643\u061F (\u0645\u062B\u0644 \u063A\u064A\u0627\u0628 \u0627\u0644\u0623\u062F\u0644\u0629 \u0627\u0644\u062A\u062C\u0631\u064A\u0628\u064A\u0629 \u0623\u0648 \u0627\u0644\u0642\u064A\u0648\u062F \u0627\u0644\u062D\u0633\u0627\u0628\u064A\u0629)."}</span></p></div><img key={1} src={img_2} alt="Google Shape;235;p25" style={{
          position: "absolute",
          left: "129.22px",
          top: "0px",
          width: "130.43px",
          height: "130.43px",
          boxSizing: "border-box",
          objectFit: "fill"
        }} /></div><div key={4} style={{
        position: "absolute",
        left: "540.65px",
        top: "363.42px",
        width: "332.69px",
        height: "130.43px"
      }}><div key={0} style={{
          position: "absolute",
          left: "0px",
          top: "11.32px",
          width: "311.65px",
          height: "107.78px",
          boxSizing: "border-box",
          backgroundColor: "transparent",
          padding: "9.6px 9.6px 9.6px 9.6px",
          wordWrap: "break-word"
        }}><p style={{
            textAlign: "justify",
            lineHeight: "1.38",
            fontSize: "calc(16pt * var(--pptx-font-scale, 1))",
            marginTop: "0",
            marginBottom: "0"
          }}><span style={{
              fontSize: "calc(16pt * var(--pptx-font-scale, 1))",
              fontFamily: "'IBM Plex Sans Arabic Medium', 'IBM Plex Sans Arabic', sans-serif",
              fontWeight: "500",
              color: "#8980BC"
            }}>{"\u0627\u0644\u0639\u0631\u0636 \u0627\u0644\u0645\u0633\u062A\u0642\u0628\u0644\u064A:"}</span><br /><span style={{
              fontSize: "calc(11pt * var(--pptx-font-scale, 1))",
              fontFamily: "'IBM Plex Sans Arabic', sans-serif",
              color: "#C36B4E"
            }}>{" \u062A\u0623\u0643\u062F \u0645\u0646 \u0639\u0631\u0636 \u062E\u0627\u0631\u0637\u0629 \u0627\u0644\u0637\u0631\u064A\u0642 \u0627\u0644\u062A\u064A \u062A\u063A\u0637\u064A 70% \u0645\u0646 \u0627\u0644\u062A\u0642\u062F\u0645\u060C \u062D\u064A\u062B \u062A\u0635\u0641 \u062E\u0637\u0629 \u0627\u0644\u0623\u0633\u0628\u0648\u0639\u064A\u0646 \u0627\u0644\u0645\u0642\u0628\u0644\u064A\u0646 \u0648\u0627\u0644\u0623\u0647\u062F\u0627\u0641 \u0627\u0644\u0645\u0631\u062C\u0648 \u062A\u062D\u0642\u064A\u0642\u0647\u0627."}</span></p></div><img key={1} src={img_2} alt="Google Shape;238;p25" style={{
          position: "absolute",
          left: "202.26px",
          top: "0px",
          width: "130.43px",
          height: "130.43px",
          boxSizing: "border-box",
          objectFit: "fill"
        }} /></div></div></div>;
};
export default Slide13;

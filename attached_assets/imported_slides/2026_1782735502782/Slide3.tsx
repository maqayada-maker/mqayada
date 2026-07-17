import React, { useState, useEffect, useRef } from "react";
import img_1 from "./assets/images/image_6.png";
import img_bg from "./assets/images/image_7.png";
const Slide3: React.FC = () => {
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
  return <div id="slide-3" ref={outerRef} className="w-screen h-screen overflow-hidden relative" style={{
    backgroundColor: "#000"
  }}><div id="slide-inner-3" style={{
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
        left: "71.12px",
        top: "110.67px",
        width: "778.68px",
        height: "56.31px",
        boxSizing: "border-box",
        backgroundColor: "transparent",
        padding: "9.6px 9.6px 9.6px 9.6px",
        ["--pptx-font-scale"]: "0.828",
        wordWrap: "break-word"
      }}><p style={{
          textAlign: "right",
          lineHeight: "0.96",
          fontSize: "calc(28pt * var(--pptx-font-scale, 1))",
          marginTop: "0",
          marginBottom: "0"
        }}><span style={{
            fontSize: "calc(28pt * var(--pptx-font-scale, 1))",
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            fontWeight: "700",
            color: "#032341"
          }}>{"\u0627\u0644\u0645\u062D\u062A\u0648\u064A\u0627\u062A:"}</span></p></div><div key={1} style={{
        position: "absolute",
        left: "633.63px",
        top: "188.6px",
        width: "166.52px",
        height: "40.31px",
        boxSizing: "border-box",
        backgroundColor: "transparent",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "9.6px 9.6px 9.6px 9.6px",
        wordWrap: "break-word"
      }}><p style={{
          textAlign: "right",
          lineHeight: "1.2",
          fontSize: "calc(15.2pt * var(--pptx-font-scale, 1))",
          marginTop: "0",
          marginBottom: "0"
        }}><span style={{
            fontSize: "calc(15.2pt * var(--pptx-font-scale, 1))",
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            color: "#032341"
          }}>{"\u0623\u0639\u0636\u0627\u0621 \u0627\u0644\u0641\u0631\u064A\u0642 "}</span></p></div><div key={2} style={{
        position: "absolute",
        left: "808.15px",
        top: "188.6px",
        width: "40.31px",
        height: "40.31px",
        boxSizing: "border-box",
        backgroundColor: "#C36B4E",
        borderRadius: "7.58px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "9.6px 0px 9.6px 0px",
        wordWrap: "break-word"
      }}><p style={{
          textAlign: "center",
          lineHeight: "1.2",
          fontSize: "calc(13pt * var(--pptx-font-scale, 1))",
          marginTop: "0",
          marginBottom: "0"
        }}><span style={{
            fontSize: "calc(13pt * var(--pptx-font-scale, 1))",
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            fontWeight: "700",
            color: "#032341"
          }}>{"01"}</span></p></div><div key={3} style={{
        position: "absolute",
        left: "633.63px",
        top: "257.85px",
        width: "166.52px",
        height: "40.31px",
        boxSizing: "border-box",
        backgroundColor: "transparent",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "9.6px 9.6px 9.6px 9.6px",
        wordWrap: "break-word"
      }}><p style={{
          textAlign: "right",
          lineHeight: "1.2",
          fontSize: "calc(15.2pt * var(--pptx-font-scale, 1))",
          marginTop: "0",
          marginBottom: "0"
        }}><span style={{
            fontSize: "calc(15.2pt * var(--pptx-font-scale, 1))",
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            color: "#032341"
          }}>{"\u0627\u0644\u0645\u0634\u0643\u0644\u0629 \u0648\u062D\u0644\u0647\u0627"}</span></p></div><div key={4} style={{
        position: "absolute",
        left: "808.15px",
        top: "257.85px",
        width: "40.31px",
        height: "40.31px",
        boxSizing: "border-box",
        backgroundColor: "#C36B4E",
        borderRadius: "7.58px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "9.6px 0px 9.6px 0px",
        wordWrap: "break-word"
      }}><p style={{
          textAlign: "center",
          lineHeight: "1.2",
          fontSize: "calc(13pt * var(--pptx-font-scale, 1))",
          marginTop: "0",
          marginBottom: "0"
        }}><span style={{
            fontSize: "calc(13pt * var(--pptx-font-scale, 1))",
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            fontWeight: "700",
            color: "#032341"
          }}>{"02"}</span></p></div><div key={5} style={{
        position: "absolute",
        left: "602.97px",
        top: "329.83px",
        width: "197.2px",
        height: "40.31px",
        boxSizing: "border-box",
        backgroundColor: "transparent",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "9.6px 9.6px 9.6px 9.6px",
        wordWrap: "break-word"
      }}><p style={{
          textAlign: "right",
          lineHeight: "1.2",
          fontSize: "calc(15.2pt * var(--pptx-font-scale, 1))",
          marginTop: "0",
          marginBottom: "0"
        }}><span style={{
            fontSize: "calc(15.2pt * var(--pptx-font-scale, 1))",
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            color: "#032341"
          }}>{"\u0648\u0635\u0641 \u0627\u0644\u0641\u0643\u0631\u0629"}</span></p></div><div key={6} style={{
        position: "absolute",
        left: "808.15px",
        top: "329.83px",
        width: "40.31px",
        height: "40.31px",
        boxSizing: "border-box",
        backgroundColor: "#C36B4E",
        borderRadius: "7.58px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "9.6px 0px 9.6px 0px",
        wordWrap: "break-word"
      }}><p style={{
          textAlign: "center",
          lineHeight: "1.2",
          fontSize: "calc(13pt * var(--pptx-font-scale, 1))",
          marginTop: "0",
          marginBottom: "0"
        }}><span style={{
            fontSize: "calc(13pt * var(--pptx-font-scale, 1))",
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            fontWeight: "700",
            color: "#032341"
          }}>{"03"}</span></p></div><div key={7} style={{
        position: "absolute",
        left: "633.63px",
        top: "399.08px",
        width: "166.52px",
        height: "40.31px",
        boxSizing: "border-box",
        backgroundColor: "transparent",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "9.6px 9.6px 9.6px 9.6px",
        wordWrap: "break-word"
      }}><p style={{
          textAlign: "right",
          lineHeight: "1.2",
          fontSize: "calc(15.2pt * var(--pptx-font-scale, 1))",
          marginTop: "0",
          marginBottom: "0"
        }}><span style={{
            fontSize: "calc(15.2pt * var(--pptx-font-scale, 1))",
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            color: "#032341"
          }}>{"\u0627\u0644\u062A\u0642\u0646\u064A\u0627\u062A \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u0629"}</span></p></div><div key={8} style={{
        position: "absolute",
        left: "808.15px",
        top: "399.08px",
        width: "40.31px",
        height: "40.31px",
        boxSizing: "border-box",
        backgroundColor: "#C36B4E",
        borderRadius: "7.58px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "9.6px 0px 9.6px 0px",
        wordWrap: "break-word"
      }}><p style={{
          textAlign: "center",
          lineHeight: "1.2",
          fontSize: "calc(13pt * var(--pptx-font-scale, 1))",
          marginTop: "0",
          marginBottom: "0"
        }}><span style={{
            fontSize: "calc(13pt * var(--pptx-font-scale, 1))",
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            fontWeight: "700",
            color: "#032341"
          }}>{"04"}</span></p></div><div key={9} style={{
        position: "absolute",
        left: "172.72px",
        top: "188.6px",
        width: "398.65px",
        height: "40.31px",
        boxSizing: "border-box",
        backgroundColor: "transparent",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "9.6px 9.6px 9.6px 9.6px",
        wordWrap: "break-word"
      }}><p style={{
          textAlign: "right",
          lineHeight: "1.2",
          fontSize: "calc(15.2pt * var(--pptx-font-scale, 1))",
          marginTop: "0",
          marginBottom: "0"
        }}><span style={{
            fontSize: "calc(15.2pt * var(--pptx-font-scale, 1))",
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            color: "#032341"
          }}>{"\u062C\u0645\u064A\u0639 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u0629 (\u0646\u0635\u064A\u0629 \u0648\u063A\u064A\u0631 \u0646\u0635\u064A\u0629)"}</span></p></div><div key={10} style={{
        position: "absolute",
        left: "579.36px",
        top: "188.6px",
        width: "40.31px",
        height: "40.31px",
        boxSizing: "border-box",
        backgroundColor: "#C36B4E",
        borderRadius: "7.58px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "9.6px 0px 9.6px 0px",
        wordWrap: "break-word"
      }}><p style={{
          textAlign: "center",
          lineHeight: "1.2",
          fontSize: "calc(13pt * var(--pptx-font-scale, 1))",
          marginTop: "0",
          marginBottom: "0"
        }}><span style={{
            fontSize: "calc(13pt * var(--pptx-font-scale, 1))",
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            fontWeight: "700",
            color: "#032341"
          }}>{"05"}</span></p></div><div key={11} style={{
        position: "absolute",
        left: "115.51px",
        top: "257.85px",
        width: "455.87px",
        height: "40.31px",
        boxSizing: "border-box",
        backgroundColor: "transparent",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "9.6px 9.6px 9.6px 9.6px",
        wordWrap: "break-word"
      }}><p style={{
          textAlign: "right",
          lineHeight: "1.2",
          fontSize: "calc(15.2pt * var(--pptx-font-scale, 1))",
          marginTop: "0",
          marginBottom: "0"
        }}><span style={{
            fontSize: "calc(15.2pt * var(--pptx-font-scale, 1))",
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            color: "#032341"
          }}>{"\u0643\u064A\u0641\u064A\u0629 \u062A\u0648\u0641\u064A\u0631 \u0647\u0630\u0647 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0648\u0643\u064A\u0641\u064A\u0629 \u0627\u0633\u062A\u062E\u062F\u0627\u0645\u0647\u0627"}</span></p></div><div key={12} style={{
        position: "absolute",
        left: "579.36px",
        top: "257.85px",
        width: "40.31px",
        height: "40.31px",
        boxSizing: "border-box",
        backgroundColor: "#C36B4E",
        borderRadius: "7.58px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "9.6px 0px 9.6px 0px",
        wordWrap: "break-word"
      }}><p style={{
          textAlign: "center",
          lineHeight: "1.2",
          fontSize: "calc(13pt * var(--pptx-font-scale, 1))",
          marginTop: "0",
          marginBottom: "0"
        }}><span style={{
            fontSize: "calc(13pt * var(--pptx-font-scale, 1))",
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            fontWeight: "700",
            color: "#032341"
          }}>{"06"}</span></p></div><div key={13} style={{
        position: "absolute",
        left: "352.55px",
        top: "329.83px",
        width: "218.83px",
        height: "40.31px",
        boxSizing: "border-box",
        backgroundColor: "transparent",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "9.6px 9.6px 9.6px 9.6px",
        wordWrap: "break-word"
      }}><p style={{
          textAlign: "right",
          lineHeight: "1.2",
          fontSize: "calc(15.2pt * var(--pptx-font-scale, 1))",
          marginTop: "0",
          marginBottom: "0"
        }}><span style={{
            fontSize: "calc(15.2pt * var(--pptx-font-scale, 1))",
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            color: "#032341"
          }}>{"\u0645\u0644\u062E\u0635"}</span></p></div><div key={14} style={{
        position: "absolute",
        left: "579.36px",
        top: "329.83px",
        width: "40.31px",
        height: "40.31px",
        boxSizing: "border-box",
        backgroundColor: "#C36B4E",
        borderRadius: "7.58px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "9.6px 0px 9.6px 0px",
        wordWrap: "break-word"
      }}><p style={{
          textAlign: "center",
          lineHeight: "1.2",
          fontSize: "calc(13pt * var(--pptx-font-scale, 1))",
          marginTop: "0",
          marginBottom: "0"
        }}><span style={{
            fontSize: "calc(13pt * var(--pptx-font-scale, 1))",
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            fontWeight: "700",
            color: "#032341"
          }}>{"07"}</span></p></div><img key={15} src={img_1} alt="Google Shape;92;p15" style={{
        position: "absolute",
        left: "31.19px",
        top: "18.7px",
        width: "87.06px",
        height: "87.06px",
        boxSizing: "border-box",
        objectFit: "fill"
      }} /></div></div>;
};
export default Slide3;

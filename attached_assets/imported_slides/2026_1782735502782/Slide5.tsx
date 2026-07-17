import React, { useState, useEffect, useRef } from "react";
import img_1 from "./assets/images/image_6.png";
import img_2 from "./assets/images/image_12.png";
import img_bg from "./assets/images/image_7.png";
const Slide5: React.FC = () => {
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
  return <div id="slide-5" ref={outerRef} className="w-screen h-screen overflow-hidden relative" style={{
    backgroundColor: "#000"
  }}><div id="slide-inner-5" style={{
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
    }}><img key={0} src={img_1} alt="Google Shape;119;p17" style={{
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
        top: "87.47px",
        width: "371.78px",
        height: "60.13px",
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
          }}>{"\u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u0629"}</span></p><p style={{
          textAlign: "right",
          lineHeight: "1.2",
          fontSize: "calc(28pt * var(--pptx-font-scale, 1))",
          marginTop: "0",
          marginBottom: "0"
        }}><span style={{
            fontSize: "calc(28pt * var(--pptx-font-scale, 1))"
          }}>{"\xA0"}</span></p></div><div key={2} style={{
        position: "absolute",
        left: "191.72px",
        top: "141.71px",
        width: "696.22px",
        height: "65.98px",
        boxSizing: "border-box",
        backgroundColor: "transparent",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "9.6px 9.6px 9.6px 9.6px",
        wordWrap: "break-word"
      }}><p style={{
          textAlign: "center",
          lineHeight: "1.2",
          fontSize: "calc(10pt * var(--pptx-font-scale, 1))",
          marginTop: "0",
          marginBottom: "0"
        }}><span style={{
            fontSize: "calc(10pt * var(--pptx-font-scale, 1))",
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            color: "#032341"
          }}>{"\u064A\u0634\u0631\u062D \u0627\u0644\u0642\u0633\u0645 \u0643\u0644 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062A\u064A \u062A\u0645 \u062C\u0645\u0639\u0647\u0627 \u0623\u0648 \u062A\u0648\u0644\u064A\u062F\u0647\u0627 \u062E\u0644\u0627\u0644 \u0627\u0644\u0645\u0634\u0631\u0648\u0639\u060C \u0633\u0648\u0627\u0621 \u0643\u0627\u0646\u062A \u0646\u0635\u064A\u0629 \u0645\u062B\u0644 \u0627\u0644\u0646\u0635\u0648\u0635 \u0623\u0648 \u063A\u064A\u0631 \u0646\u0635\u064A\u0629 \u0645\u062B\u0644 \u0627\u0644\u0635\u0648\u0631 \u0648\u0627\u0644\u0631\u0633\u0648\u0645 \u0627\u0644\u0628\u064A\u0627\u0646\u064A\u0629."}</span></p></div><div key={3} style={{
        position: "absolute",
        left: "101.64px",
        top: "212.19px",
        width: "786.3px",
        height: "87.06px",
        boxSizing: "border-box",
        backgroundColor: "transparent",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "9.6px 9.6px 9.6px 9.6px",
        wordWrap: "break-word"
      }}><p style={{
          textAlign: "right",
          lineHeight: "1.8",
          textIndent: "-30.67px",
          paddingLeft: "48px",
          fontSize: "calc(10pt * var(--pptx-font-scale, 1))",
          marginTop: "0",
          marginBottom: "0"
        }}><span style={{
            marginRight: "8px",
            color: "#C36B4E",
            fontSize: "10pt"
          }}>{"\u25CF"}</span><span style={{
            fontSize: "calc(10pt * var(--pptx-font-scale, 1))",
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            color: "#C36B4E"
          }}>{"\u0645\u0627 \u0647\u064A \u0645\u0635\u0627\u062F\u0631 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062A\u064A \u0627\u0633\u062A\u062E\u062F\u0645\u062A\u0647\u0627\u061F"}</span></p><p style={{
          textAlign: "right",
          lineHeight: "1.8",
          textIndent: "-30.67px",
          paddingLeft: "48px",
          fontSize: "calc(10pt * var(--pptx-font-scale, 1))",
          marginTop: "0",
          marginBottom: "0"
        }}><span style={{
            marginRight: "8px",
            color: "#C36B4E",
            fontSize: "10pt"
          }}>{"\u25CF"}</span><span style={{
            fontSize: "calc(10pt * var(--pptx-font-scale, 1))",
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            color: "#C36B4E"
          }}>{"\u0645\u0627 \u0627\u0644\u0630\u064A \u0642\u0645\u062A \u0628\u0647 \u0644\u062A\u0646\u0638\u064A\u0641\u0647\u0627 \u0623\u0648 \u0645\u0639\u0627\u0644\u062C\u062A\u0647\u0627\u061F"}</span></p><p style={{
          textAlign: "right",
          lineHeight: "1.8",
          textIndent: "-30.67px",
          paddingLeft: "48px",
          fontSize: "calc(10pt * var(--pptx-font-scale, 1))",
          marginTop: "0",
          marginBottom: "0"
        }}><span style={{
            marginRight: "8px",
            color: "#C36B4E",
            fontSize: "10pt"
          }}>{"\u25CF"}</span><span style={{
            fontSize: "calc(10pt * var(--pptx-font-scale, 1))",
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            color: "#C36B4E"
          }}>{"\u0645\u0627 \u0647\u064A \u0627\u0644\u062A\u062D\u062F\u064A\u0627\u062A \u0627\u0644\u062A\u064A \u0648\u0627\u062C\u0647\u062A\u0643 \u0641\u064A \u062C\u0645\u0639 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A\u061F (\u0645\u062B\u0644 \u0635\u0639\u0648\u0628\u0629 \u0627\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0628\u064A\u0648\u0645\u062A\u0631\u064A\u0629 \u0644\u0644\u0631\u064A\u0627\u0636\u064A\u064A\u0646)."}</span></p><p style={{
          textAlign: "center",
          lineHeight: "1.8",
          fontSize: "calc(10pt * var(--pptx-font-scale, 1))",
          marginTop: "0",
          marginBottom: "0"
        }}><span style={{
            fontSize: "calc(10pt * var(--pptx-font-scale, 1))"
          }}>{"\xA0"}</span></p></div><div key={4} style={{
        position: "absolute",
        left: "221.28px",
        top: "313.68px",
        width: "666.65px",
        height: "85.27px"
      }}><div key={0} style={{
          position: "absolute",
          left: "0px",
          top: "0px",
          width: "203.08px",
          height: "85.27px"
        }}><img key={0} src={img_2} alt="Google Shape;125;p17" style={{
            position: "absolute",
            left: "0px",
            top: "24.34px",
            width: "203.08px",
            height: "60.92px",
            boxSizing: "border-box",
            objectFit: "fill"
          }} /><div key={1} style={{
            position: "absolute",
            left: "37.6px",
            top: "0px",
            width: "127.87px",
            height: "52.57px",
            boxSizing: "border-box",
            backgroundColor: "transparent",
            padding: "9.6px 9.6px 9.6px 9.6px",
            wordWrap: "break-word"
          }}><p style={{
              textAlign: "center",
              lineHeight: "1.2",
              fontSize: "calc(22pt * var(--pptx-font-scale, 1))",
              marginTop: "0",
              marginBottom: "0"
            }}><span style={{
                fontSize: "calc(22pt * var(--pptx-font-scale, 1))",
                fontFamily: "'IBM Plex Sans Arabic Medium', 'IBM Plex Sans Arabic', sans-serif",
                fontWeight: "500",
                color: "#032341"
              }}>{"0%"}</span></p></div><div key={2} style={{
            position: "absolute",
            left: "37.6px",
            top: "40.92px",
            width: "127.87px",
            height: "44.35px",
            boxSizing: "border-box",
            backgroundColor: "transparent",
            padding: "9.6px 9.6px 9.6px 9.6px",
            wordWrap: "break-word"
          }}><p style={{
              textAlign: "center",
              lineHeight: "1.2",
              fontSize: "calc(15pt * var(--pptx-font-scale, 1))",
              marginTop: "0",
              marginBottom: "0"
            }}><span style={{
                fontSize: "calc(15pt * var(--pptx-font-scale, 1))",
                fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                color: "#C36B4E"
              }}>{"1st quarter"}</span></p><p style={{
              textAlign: "right",
              lineHeight: "1.2",
              fontSize: "calc(13pt * var(--pptx-font-scale, 1))",
              marginTop: "0",
              marginBottom: "0"
            }}><span style={{
                fontSize: "calc(13pt * var(--pptx-font-scale, 1))"
              }}>{"\xA0"}</span></p></div></div><div key={1} style={{
          position: "absolute",
          left: "231.79px",
          top: "0px",
          width: "203.08px",
          height: "85.27px"
        }}><img key={0} src={img_2} alt="Google Shape;129;p17" style={{
            position: "absolute",
            left: "0px",
            top: "24.34px",
            width: "203.08px",
            height: "60.92px",
            boxSizing: "border-box",
            objectFit: "fill"
          }} /><div key={1} style={{
            position: "absolute",
            left: "37.6px",
            top: "0px",
            width: "127.87px",
            height: "52.57px",
            boxSizing: "border-box",
            backgroundColor: "transparent",
            padding: "9.6px 9.6px 9.6px 9.6px",
            wordWrap: "break-word"
          }}><p style={{
              textAlign: "center",
              lineHeight: "1.2",
              fontSize: "calc(22pt * var(--pptx-font-scale, 1))",
              marginTop: "0",
              marginBottom: "0"
            }}><span style={{
                fontSize: "calc(22pt * var(--pptx-font-scale, 1))",
                fontFamily: "'IBM Plex Sans Arabic Medium', 'IBM Plex Sans Arabic', sans-serif",
                fontWeight: "500",
                color: "#032341"
              }}>{"0%"}</span></p></div><div key={2} style={{
            position: "absolute",
            left: "37.6px",
            top: "40.92px",
            width: "127.87px",
            height: "44.35px",
            boxSizing: "border-box",
            backgroundColor: "transparent",
            padding: "9.6px 9.6px 9.6px 9.6px",
            wordWrap: "break-word"
          }}><p style={{
              textAlign: "center",
              lineHeight: "1.2",
              fontSize: "calc(15pt * var(--pptx-font-scale, 1))",
              marginTop: "0",
              marginBottom: "0"
            }}><span style={{
                fontSize: "calc(15pt * var(--pptx-font-scale, 1))",
                fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                color: "#C36B4E"
              }}>{"2st quarter"}</span></p><p style={{
              textAlign: "right",
              lineHeight: "1.2",
              fontSize: "calc(13pt * var(--pptx-font-scale, 1))",
              marginTop: "0",
              marginBottom: "0"
            }}><span style={{
                fontSize: "calc(13pt * var(--pptx-font-scale, 1))"
              }}>{"\xA0"}</span></p></div></div><div key={2} style={{
          position: "absolute",
          left: "463.57px",
          top: "0px",
          width: "203.08px",
          height: "85.27px"
        }}><img key={0} src={img_2} alt="Google Shape;133;p17" style={{
            position: "absolute",
            left: "0px",
            top: "24.34px",
            width: "203.08px",
            height: "60.92px",
            boxSizing: "border-box",
            objectFit: "fill"
          }} /><div key={1} style={{
            position: "absolute",
            left: "37.6px",
            top: "0px",
            width: "127.87px",
            height: "52.57px",
            boxSizing: "border-box",
            backgroundColor: "transparent",
            padding: "9.6px 9.6px 9.6px 9.6px",
            wordWrap: "break-word"
          }}><p style={{
              textAlign: "center",
              lineHeight: "1.2",
              fontSize: "calc(22pt * var(--pptx-font-scale, 1))",
              marginTop: "0",
              marginBottom: "0"
            }}><span style={{
                fontSize: "calc(22pt * var(--pptx-font-scale, 1))",
                fontFamily: "'IBM Plex Sans Arabic Medium', 'IBM Plex Sans Arabic', sans-serif",
                fontWeight: "500",
                color: "#032341"
              }}>{"0%"}</span></p></div><div key={2} style={{
            position: "absolute",
            left: "37.6px",
            top: "40.92px",
            width: "127.87px",
            height: "44.35px",
            boxSizing: "border-box",
            backgroundColor: "transparent",
            padding: "9.6px 9.6px 9.6px 9.6px",
            wordWrap: "break-word"
          }}><p style={{
              textAlign: "center",
              lineHeight: "1.2",
              fontSize: "calc(15pt * var(--pptx-font-scale, 1))",
              marginTop: "0",
              marginBottom: "0"
            }}><span style={{
                fontSize: "calc(15pt * var(--pptx-font-scale, 1))",
                fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                color: "#C36B4E"
              }}>{"3st quarter"}</span></p><p style={{
              textAlign: "right",
              lineHeight: "1.2",
              fontSize: "calc(13pt * var(--pptx-font-scale, 1))",
              marginTop: "0",
              marginBottom: "0"
            }}><span style={{
                fontSize: "calc(13pt * var(--pptx-font-scale, 1))"
              }}>{"\xA0"}</span></p></div></div></div></div></div>;
};
export default Slide5;

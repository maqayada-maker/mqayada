import React, { useState, useEffect, useRef } from "react";
import img_1 from "./assets/images/image_6.png";
import img_2 from "./assets/images/image_8.png";
import img_3 from "./assets/images/image_9.png";
import img_bg from "./assets/images/image_7.png";
const Slide6: React.FC = () => {
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
  return <div id="slide-6" ref={outerRef} className="w-screen h-screen overflow-hidden relative" style={{
    backgroundColor: "#000"
  }}><div id="slide-inner-6" style={{
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
    }}><img key={0} src={img_1} alt="Google Shape;140;p18" style={{
        position: "absolute",
        left: "31.19px",
        top: "18.7px",
        width: "87.06px",
        height: "87.06px",
        boxSizing: "border-box",
        objectFit: "fill"
      }} /><div key={1} style={{
        position: "absolute",
        left: "525.57px",
        top: "87.47px",
        width: "362.36px",
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
          }}>{"\u0627\u0644\u062A\u0642\u0646\u064A\u0627\u062A \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u0629"}</span></p></div><div key={2} style={{
        position: "absolute",
        left: "60.67px",
        top: "175.17px",
        width: "813.4px",
        height: "82.12px"
      }}><div key={0} style={{
          position: "absolute",
          left: "420.31px",
          top: "0px",
          width: "393.09px",
          height: "82.12px"
        }}><div key={0} style={{
            position: "absolute",
            left: "0px",
            top: "1.01px",
            width: "332.44px",
            height: "81.1px",
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
              fontSize: "calc(11pt * var(--pptx-font-scale, 1))",
              marginTop: "0",
              marginBottom: "0"
            }}><span style={{
                fontSize: "calc(11pt * var(--pptx-font-scale, 1))",
                fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                color: "#032341"
              }}>{"\u064A\u0639\u0631\u0636 \u0647\u0630\u0627 \u0627\u0644\u0642\u0633\u0645 \u0627\u0644\u062A\u0642\u0646\u064A\u0627\u062A \u0627\u0644\u0645\u062E\u062A\u0644\u0641\u0629 \u0627\u0644\u062A\u064A \u062A\u0645 \u0627\u0633\u062A\u062E\u062F\u0627\u0645\u0647\u0627 \u0641\u064A \u0627\u0644\u0645\u0634\u0631\u0648\u0639\u060C \u0645\u062B\u0644 \u0627\u0644\u0623\u062F\u0648\u0627\u062A \u0627\u0644\u0628\u0631\u0645\u062C\u064A\u0629\u060C \u0627\u0644\u0623\u0637\u0631 \u0627\u0644\u062A\u0642\u0646\u064A\u0629\u060C \u0623\u0648 \u0627\u0644\u0644\u063A\u0627\u062A \u0627\u0644\u0628\u0631\u0645\u062C\u064A\u0629."}</span></p></div><div key={1} style={{
            position: "absolute",
            left: "342.15px",
            top: "0px",
            width: "50.93px",
            height: "67.13px"
          }}><img key={0} src={img_2} alt="Google Shape;146;p18" style={{
              position: "absolute",
              left: "5.07px",
              top: "26.35px",
              width: "40.78px",
              height: "40.78px",
              boxSizing: "border-box",
              objectFit: "fill"
            }} /><img key={1} src={img_3} alt="Google Shape;147;p18" style={{
              position: "absolute",
              left: "0px",
              top: "0px",
              width: "50.93px",
              height: "50.93px",
              boxSizing: "border-box",
              objectFit: "fill"
            }} /></div></div><div key={1} style={{
          position: "absolute",
          left: "0px",
          top: "0px",
          width: "393.09px",
          height: "82.12px"
        }}><div key={0} style={{
            position: "absolute",
            left: "0px",
            top: "1.01px",
            width: "332.44px",
            height: "81.1px",
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
              fontSize: "calc(11pt * var(--pptx-font-scale, 1))",
              marginTop: "0",
              marginBottom: "0"
            }}><span style={{
                fontSize: "calc(11pt * var(--pptx-font-scale, 1))",
                fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                color: "#032341"
              }}>{"\u064A\u0639\u0631\u0636 \u0647\u0630\u0627 \u0627\u0644\u0642\u0633\u0645 \u0627\u0644\u062A\u0642\u0646\u064A\u0627\u062A \u0627\u0644\u0645\u062E\u062A\u0644\u0641\u0629 \u0627\u0644\u062A\u064A \u062A\u0645 \u0627\u0633\u062A\u062E\u062F\u0627\u0645\u0647\u0627 \u0641\u064A \u0627\u0644\u0645\u0634\u0631\u0648\u0639\u060C \u0645\u062B\u0644 \u0627\u0644\u0623\u062F\u0648\u0627\u062A \u0627\u0644\u0628\u0631\u0645\u062C\u064A\u0629\u060C \u0627\u0644\u0623\u0637\u0631 \u0627\u0644\u062A\u0642\u0646\u064A\u0629\u060C \u0623\u0648 \u0627\u0644\u0644\u063A\u0627\u062A \u0627\u0644\u0628\u0631\u0645\u062C\u064A\u0629."}</span></p></div><div key={1} style={{
            position: "absolute",
            left: "342.15px",
            top: "0px",
            width: "50.93px",
            height: "67.13px"
          }}><img key={0} src={img_2} alt="Google Shape;151;p18" style={{
              position: "absolute",
              left: "5.07px",
              top: "26.35px",
              width: "40.78px",
              height: "40.78px",
              boxSizing: "border-box",
              objectFit: "fill"
            }} /><img key={1} src={img_3} alt="Google Shape;152;p18" style={{
              position: "absolute",
              left: "0px",
              top: "0px",
              width: "50.93px",
              height: "50.93px",
              boxSizing: "border-box",
              objectFit: "fill"
            }} /></div></div></div><div key={3} style={{
        position: "absolute",
        left: "60.67px",
        top: "289.18px",
        width: "813.4px",
        height: "82.12px"
      }}><div key={0} style={{
          position: "absolute",
          left: "420.31px",
          top: "0px",
          width: "393.09px",
          height: "82.12px"
        }}><div key={0} style={{
            position: "absolute",
            left: "0px",
            top: "1.01px",
            width: "332.44px",
            height: "81.1px",
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
              fontSize: "calc(11pt * var(--pptx-font-scale, 1))",
              marginTop: "0",
              marginBottom: "0"
            }}><span style={{
                fontSize: "calc(11pt * var(--pptx-font-scale, 1))",
                fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                color: "#032341"
              }}>{"\u064A\u0639\u0631\u0636 \u0647\u0630\u0627 \u0627\u0644\u0642\u0633\u0645 \u0627\u0644\u062A\u0642\u0646\u064A\u0627\u062A \u0627\u0644\u0645\u062E\u062A\u0644\u0641\u0629 \u0627\u0644\u062A\u064A \u062A\u0645 \u0627\u0633\u062A\u062E\u062F\u0627\u0645\u0647\u0627 \u0641\u064A \u0627\u0644\u0645\u0634\u0631\u0648\u0639\u060C \u0645\u062B\u0644 \u0627\u0644\u0623\u062F\u0648\u0627\u062A \u0627\u0644\u0628\u0631\u0645\u062C\u064A\u0629\u060C \u0627\u0644\u0623\u0637\u0631 \u0627\u0644\u062A\u0642\u0646\u064A\u0629\u060C \u0623\u0648 \u0627\u0644\u0644\u063A\u0627\u062A \u0627\u0644\u0628\u0631\u0645\u062C\u064A\u0629."}</span></p></div><div key={1} style={{
            position: "absolute",
            left: "342.15px",
            top: "0px",
            width: "50.93px",
            height: "67.13px"
          }}><img key={0} src={img_2} alt="Google Shape;157;p18" style={{
              position: "absolute",
              left: "5.07px",
              top: "26.35px",
              width: "40.78px",
              height: "40.78px",
              boxSizing: "border-box",
              objectFit: "fill"
            }} /><img key={1} src={img_3} alt="Google Shape;158;p18" style={{
              position: "absolute",
              left: "0px",
              top: "0px",
              width: "50.93px",
              height: "50.93px",
              boxSizing: "border-box",
              objectFit: "fill"
            }} /></div></div><div key={1} style={{
          position: "absolute",
          left: "0px",
          top: "0px",
          width: "393.09px",
          height: "82.12px"
        }}><div key={0} style={{
            position: "absolute",
            left: "0px",
            top: "1.01px",
            width: "332.44px",
            height: "81.1px",
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
              fontSize: "calc(11pt * var(--pptx-font-scale, 1))",
              marginTop: "0",
              marginBottom: "0"
            }}><span style={{
                fontSize: "calc(11pt * var(--pptx-font-scale, 1))",
                fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                color: "#032341"
              }}>{"\u064A\u0639\u0631\u0636 \u0647\u0630\u0627 \u0627\u0644\u0642\u0633\u0645 \u0627\u0644\u062A\u0642\u0646\u064A\u0627\u062A \u0627\u0644\u0645\u062E\u062A\u0644\u0641\u0629 \u0627\u0644\u062A\u064A \u062A\u0645 \u0627\u0633\u062A\u062E\u062F\u0627\u0645\u0647\u0627 \u0641\u064A \u0627\u0644\u0645\u0634\u0631\u0648\u0639\u060C \u0645\u062B\u0644 \u0627\u0644\u0623\u062F\u0648\u0627\u062A \u0627\u0644\u0628\u0631\u0645\u062C\u064A\u0629\u060C \u0627\u0644\u0623\u0637\u0631 \u0627\u0644\u062A\u0642\u0646\u064A\u0629\u060C \u0623\u0648 \u0627\u0644\u0644\u063A\u0627\u062A \u0627\u0644\u0628\u0631\u0645\u062C\u064A\u0629."}</span></p></div><div key={1} style={{
            position: "absolute",
            left: "342.15px",
            top: "0px",
            width: "50.93px",
            height: "67.13px"
          }}><img key={0} src={img_2} alt="Google Shape;162;p18" style={{
              position: "absolute",
              left: "5.07px",
              top: "26.35px",
              width: "40.78px",
              height: "40.78px",
              boxSizing: "border-box",
              objectFit: "fill"
            }} /><img key={1} src={img_3} alt="Google Shape;163;p18" style={{
              position: "absolute",
              left: "0px",
              top: "0px",
              width: "50.93px",
              height: "50.93px",
              boxSizing: "border-box",
              objectFit: "fill"
            }} /></div></div></div><div key={4} style={{
        position: "absolute",
        left: "60.67px",
        top: "403.19px",
        width: "813.4px",
        height: "82.12px"
      }}><div key={0} style={{
          position: "absolute",
          left: "420.31px",
          top: "0px",
          width: "393.09px",
          height: "82.12px"
        }}><div key={0} style={{
            position: "absolute",
            left: "0px",
            top: "1.01px",
            width: "332.44px",
            height: "81.1px",
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
              fontSize: "calc(11pt * var(--pptx-font-scale, 1))",
              marginTop: "0",
              marginBottom: "0"
            }}><span style={{
                fontSize: "calc(11pt * var(--pptx-font-scale, 1))",
                fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                color: "#032341"
              }}>{"\u064A\u0639\u0631\u0636 \u0647\u0630\u0627 \u0627\u0644\u0642\u0633\u0645 \u0627\u0644\u062A\u0642\u0646\u064A\u0627\u062A \u0627\u0644\u0645\u062E\u062A\u0644\u0641\u0629 \u0627\u0644\u062A\u064A \u062A\u0645 \u0627\u0633\u062A\u062E\u062F\u0627\u0645\u0647\u0627 \u0641\u064A \u0627\u0644\u0645\u0634\u0631\u0648\u0639\u060C \u0645\u062B\u0644 \u0627\u0644\u0623\u062F\u0648\u0627\u062A \u0627\u0644\u0628\u0631\u0645\u062C\u064A\u0629\u060C \u0627\u0644\u0623\u0637\u0631 \u0627\u0644\u062A\u0642\u0646\u064A\u0629\u060C \u0623\u0648 \u0627\u0644\u0644\u063A\u0627\u062A \u0627\u0644\u0628\u0631\u0645\u062C\u064A\u0629."}</span></p></div><div key={1} style={{
            position: "absolute",
            left: "342.15px",
            top: "0px",
            width: "50.93px",
            height: "67.13px"
          }}><img key={0} src={img_2} alt="Google Shape;168;p18" style={{
              position: "absolute",
              left: "5.07px",
              top: "26.35px",
              width: "40.78px",
              height: "40.78px",
              boxSizing: "border-box",
              objectFit: "fill"
            }} /><img key={1} src={img_3} alt="Google Shape;169;p18" style={{
              position: "absolute",
              left: "0px",
              top: "0px",
              width: "50.93px",
              height: "50.93px",
              boxSizing: "border-box",
              objectFit: "fill"
            }} /></div></div><div key={1} style={{
          position: "absolute",
          left: "0px",
          top: "0px",
          width: "393.09px",
          height: "82.12px"
        }}><div key={0} style={{
            position: "absolute",
            left: "0px",
            top: "1.01px",
            width: "332.44px",
            height: "81.1px",
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
              fontSize: "calc(11pt * var(--pptx-font-scale, 1))",
              marginTop: "0",
              marginBottom: "0"
            }}><span style={{
                fontSize: "calc(11pt * var(--pptx-font-scale, 1))",
                fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                color: "#032341"
              }}>{"\u064A\u0639\u0631\u0636 \u0647\u0630\u0627 \u0627\u0644\u0642\u0633\u0645 \u0627\u0644\u062A\u0642\u0646\u064A\u0627\u062A \u0627\u0644\u0645\u062E\u062A\u0644\u0641\u0629 \u0627\u0644\u062A\u064A \u062A\u0645 \u0627\u0633\u062A\u062E\u062F\u0627\u0645\u0647\u0627 \u0641\u064A \u0627\u0644\u0645\u0634\u0631\u0648\u0639\u060C \u0645\u062B\u0644 \u0627\u0644\u0623\u062F\u0648\u0627\u062A \u0627\u0644\u0628\u0631\u0645\u062C\u064A\u0629\u060C \u0627\u0644\u0623\u0637\u0631 \u0627\u0644\u062A\u0642\u0646\u064A\u0629\u060C \u0623\u0648 \u0627\u0644\u0644\u063A\u0627\u062A \u0627\u0644\u0628\u0631\u0645\u062C\u064A\u0629."}</span></p></div><div key={1} style={{
            position: "absolute",
            left: "342.15px",
            top: "0px",
            width: "50.93px",
            height: "67.13px"
          }}><img key={0} src={img_2} alt="Google Shape;173;p18" style={{
              position: "absolute",
              left: "5.07px",
              top: "26.35px",
              width: "40.78px",
              height: "40.78px",
              boxSizing: "border-box",
              objectFit: "fill"
            }} /><img key={1} src={img_3} alt="Google Shape;174;p18" style={{
              position: "absolute",
              left: "0px",
              top: "0px",
              width: "50.93px",
              height: "50.93px",
              boxSizing: "border-box",
              objectFit: "fill"
            }} /></div></div></div></div></div>;
};
export default Slide6;

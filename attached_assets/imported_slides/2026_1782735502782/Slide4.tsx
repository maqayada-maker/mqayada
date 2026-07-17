import React, { useState, useEffect, useRef } from "react";
import img_1 from "./assets/images/image_6.png";
import img_2 from "./assets/images/image_8.png";
import img_3 from "./assets/images/image_9.png";
import img_4 from "./assets/images/image_10.png";
import img_5 from "./assets/images/image_11.png";
import img_bg from "./assets/images/image_7.png";
const Slide4: React.FC = () => {
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
  return <div id="slide-4" ref={outerRef} className="w-screen h-screen overflow-hidden relative" style={{
    backgroundColor: "#000"
  }}><div id="slide-inner-4" style={{
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
    }}><img key={0} src={img_1} alt="Google Shape;97;p16" style={{
        position: "absolute",
        left: "31.19px",
        top: "18.7px",
        width: "87.06px",
        height: "87.06px",
        boxSizing: "border-box",
        objectFit: "fill"
      }} /><div key={1} style={{
        position: "absolute",
        left: "636px",
        top: "87.47px",
        width: "251.94px",
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
          }}>{"\u0627\u0644\u0645\u0634\u0643\u0644\u0629  \u0648\u062D\u0644\u0651\u0647\u0627"}</span></p></div><div key={2} style={{
        position: "absolute",
        left: "191.72px",
        top: "154.98px",
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
          textAlign: "right",
          lineHeight: "1.2",
          fontSize: "calc(9pt * var(--pptx-font-scale, 1))",
          marginTop: "0",
          marginBottom: "0"
        }}><span style={{
            fontSize: "calc(9pt * var(--pptx-font-scale, 1))",
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            color: "#032341"
          }}>{"\u064A\u0639\u0631\u0636 \u0647\u0630\u0627 \u0627\u0644\u0642\u0633\u0645 \u0627\u0644\u0645\u0634\u0643\u0644\u0629 \u0627\u0644\u062A\u064A \u064A\u0648\u0627\u062C\u0647\u0647\u0627 \u0627\u0644\u0645\u0634\u0631\u0648\u0639 \u0623\u0648 \u0627\u0644\u062C\u0645\u0647\u0648\u0631 \u0627\u0644\u0645\u0633\u062A\u0647\u062F\u0641\u060C \u0625\u0644\u0649 \u062C\u0627\u0646\u0628 \u0627\u0644\u062D\u0644 \u0627\u0644\u0645\u0642\u062A\u0631\u062D \u0648\u0643\u064A\u0641\u064A\u0629 \u062A\u0642\u062F\u064A\u0645\u0647 \u0628\u0634\u0643\u0644 \u0645\u0628\u062A\u0643\u0631 \u0648\u0641\u0639\u0651\u0627\u0644."}</span></p><p style={{
          textAlign: "right",
          lineHeight: "1.2",
          fontSize: "calc(9pt * var(--pptx-font-scale, 1))",
          marginTop: "0",
          marginBottom: "0"
        }}><span style={{
            fontSize: "calc(9pt * var(--pptx-font-scale, 1))"
          }}>{"\xA0"}</span></p><p style={{
          textAlign: "right",
          lineHeight: "1.2",
          fontSize: "calc(9pt * var(--pptx-font-scale, 1))",
          marginTop: "0",
          marginBottom: "0"
        }}><span style={{
            fontSize: "calc(9pt * var(--pptx-font-scale, 1))"
          }}>{"\xA0"}</span></p></div><div key={3} style={{
        position: "absolute",
        left: "182.98px",
        top: "216.77px",
        width: "389.23px",
        height: "65.98px",
        boxSizing: "border-box",
        backgroundColor: "transparent",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "9.6px 9.6px 9.6px 9.6px",
        wordWrap: "break-word"
      }}><p style={{
          textAlign: "right",
          lineHeight: "1.2",
          fontSize: "calc(9pt * var(--pptx-font-scale, 1))",
          marginTop: "0",
          marginBottom: "0"
        }}><span style={{
            fontSize: "calc(9pt * var(--pptx-font-scale, 1))",
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            color: "#032341"
          }}>{"Utilize technology and customer feedback to come up with novel solutions that meet your customer\u2019s demands or needs"}</span></p></div><div key={4} style={{
        position: "absolute",
        left: "182.98px",
        top: "297.87px",
        width: "389.23px",
        height: "65.98px",
        boxSizing: "border-box",
        backgroundColor: "transparent",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "9.6px 9.6px 9.6px 9.6px",
        wordWrap: "break-word"
      }}><p style={{
          textAlign: "right",
          lineHeight: "1.2",
          fontSize: "calc(9pt * var(--pptx-font-scale, 1))",
          marginTop: "0",
          marginBottom: "0"
        }}><span style={{
            fontSize: "calc(9pt * var(--pptx-font-scale, 1))",
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            color: "#032341"
          }}>{"Monitor changes in the marketplace, such as shifts in consumer behavior or emerging technologies, to stay competitive and capitalize on new opportunities and trends"}</span></p></div><div key={5} style={{
        position: "absolute",
        left: "182.98px",
        top: "381.48px",
        width: "389.23px",
        height: "65.98px",
        boxSizing: "border-box",
        backgroundColor: "transparent",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "9.6px 9.6px 9.6px 9.6px",
        wordWrap: "break-word"
      }}><p style={{
          textAlign: "right",
          lineHeight: "1.2",
          fontSize: "calc(9pt * var(--pptx-font-scale, 1))",
          marginTop: "0",
          marginBottom: "0"
        }}><span style={{
            fontSize: "calc(9pt * var(--pptx-font-scale, 1))",
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            color: "#032341"
          }}>{"Identify times of year when demand for certain products may spike, such as holidays or special occasions, and use these times to target customers or maximize sales"}</span></p></div><div key={6} style={{
        position: "absolute",
        left: "576.14px",
        top: "216.77px",
        width: "222.46px",
        height: "65.98px",
        boxSizing: "border-box",
        backgroundColor: "transparent",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "9.6px 9.6px 9.6px 9.6px",
        wordWrap: "break-word"
      }}><p style={{
          textAlign: "right",
          lineHeight: "1.2",
          fontSize: "calc(15pt * var(--pptx-font-scale, 1))",
          marginTop: "0",
          marginBottom: "0"
        }}><span style={{
            fontSize: "calc(15pt * var(--pptx-font-scale, 1))",
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            color: "#032341"
          }}>{"Innovative solutions"}</span></p></div><div key={7} style={{
        position: "absolute",
        left: "576.14px",
        top: "297.87px",
        width: "222.46px",
        height: "65.98px",
        boxSizing: "border-box",
        backgroundColor: "transparent",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "9.6px 9.6px 9.6px 9.6px",
        wordWrap: "break-word"
      }}><p style={{
          textAlign: "right",
          lineHeight: "1.2",
          fontSize: "calc(15pt * var(--pptx-font-scale, 1))",
          marginTop: "0",
          marginBottom: "0"
        }}><span style={{
            fontSize: "calc(15pt * var(--pptx-font-scale, 1))",
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            color: "#032341"
          }}>{"Stay ahead of trends"}</span></p></div><div key={8} style={{
        position: "absolute",
        left: "576.14px",
        top: "381.48px",
        width: "222.46px",
        height: "65.98px",
        boxSizing: "border-box",
        backgroundColor: "transparent",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "9.6px 9.6px 9.6px 9.6px",
        wordWrap: "break-word"
      }}><p style={{
          textAlign: "right",
          lineHeight: "1.2",
          fontSize: "calc(15pt * var(--pptx-font-scale, 1))",
          marginTop: "0",
          marginBottom: "0"
        }}><span style={{
            fontSize: "calc(15pt * var(--pptx-font-scale, 1))",
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            color: "#032341"
          }}>{"Seasonal spikes"}</span></p></div><div key={9} style={{
        position: "absolute",
        left: "837.01px",
        top: "216.19px",
        width: "50.93px",
        height: "67.13px"
      }}><img key={0} src={img_2} alt="Google Shape;107;p16" style={{
          position: "absolute",
          left: "5.07px",
          top: "26.35px",
          width: "40.78px",
          height: "40.78px",
          boxSizing: "border-box",
          objectFit: "fill"
        }} /><img key={1} src={img_3} alt="Google Shape;108;p16" style={{
          position: "absolute",
          left: "0px",
          top: "0px",
          width: "50.93px",
          height: "50.93px",
          boxSizing: "border-box",
          objectFit: "fill"
        }} /></div><div key={10} style={{
        position: "absolute",
        left: "842.08px",
        top: "299.08px",
        width: "40.78px",
        height: "61.35px"
      }}><img key={0} src={img_4} alt="Google Shape;110;p16" style={{
          position: "absolute",
          left: "0px",
          top: "0px",
          width: "40.78px",
          height: "40.78px",
          boxSizing: "border-box",
          objectFit: "fill"
        }} /><img key={1} src={img_2} alt="Google Shape;111;p16" style={{
          position: "absolute",
          left: "0px",
          top: "20.56px",
          width: "40.78px",
          height: "40.78px",
          boxSizing: "border-box",
          objectFit: "fill"
        }} /></div><div key={11} style={{
        position: "absolute",
        left: "840.25px",
        top: "376.19px",
        width: "44.43px",
        height: "59.38px"
      }}><img key={0} src={img_5} alt="Google Shape;113;p16" style={{
          position: "absolute",
          left: "0px",
          top: "0px",
          width: "44.43px",
          height: "44.44px",
          boxSizing: "border-box",
          objectFit: "fill"
        }} /><img key={1} src={img_2} alt="Google Shape;114;p16" style={{
          position: "absolute",
          left: "3.65px",
          top: "18.6px",
          width: "40.78px",
          height: "40.78px",
          boxSizing: "border-box",
          objectFit: "fill"
        }} /></div></div></div>;
};
export default Slide4;

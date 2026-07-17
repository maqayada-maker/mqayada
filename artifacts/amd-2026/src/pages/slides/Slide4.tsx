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
      direction: "rtl",
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
          }}>{"\u0627\u0644\u0645\u0634\u0643\u0644\u0629 \u0648\u062D\u0644\u0651\u0647\u0627"}</span></p></div><div key={2} style={{
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
          }}>{"تواجه الأسر السعودية صعوبة في تحسين قروضها القائمة: تفاوضٌ يدوي مع كل بنك، غياب الشفافية في التسعير، وتكاليف تحويل مرتفعة، إضافةً إلى مكالمات تسويقية مزعجة بمجرّد الاستفسار. منصة مقايضة سوقٌ عكسيٌّ رقمي تتنافس فيه الجهات التمويلية المرخّصة على إعادة هيكلة دين العميل."}</span></p><p style={{
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
          }}>{"بدلاً من ملاحقة العميل للبنوك، تتقدّم الجهات المرخّصة بعروضٍ تنافسية على طلبٍ ماليٍّ واحد."}</span></p></div><div key={4} style={{
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
          }}>{"تبقى هوية العميل مخفية حتى لحظة قبوله للعرض، ما يمنع المكالمات التسويقية ويضمن حياد المنافسة."}</span></p></div><div key={5} style={{
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
          }}>{"المنصة محايدة وتعرض العروض جنباً إلى جنب بمساعدة مساعدٍ ذكي، وتتقاضى عمولة نجاح من الجهة الفائزة فقط."}</span></p></div><div key={6} style={{
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
          }}>{"مزاد عكسي"}</span></p></div><div key={7} style={{
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
          }}>{"خصوصية وسرّية"}</span></p></div><div key={8} style={{
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
          }}>{"حياد ومقارنة"}</span></p></div><div key={9} style={{
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

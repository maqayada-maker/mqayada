import React, { useState, useEffect, useRef } from "react";
import img_1 from "./assets/images/image_6.png";
import img_bg from "./assets/images/image_7.png";

const FONT = "'IBM Plex Sans Arabic', sans-serif";
const NAVY = "#032341";
const TERRA = "#C36B4E";

const rows = [
  {
    label: "التخصص",
    us: "مقايضة المديونية القائمة حصراً",
    them: "تمويل جديد عام غير متخصص",
  },
  {
    label: "آلية العمل",
    us: "جهات التمويل تتنافس على العميل",
    them: "العميل يطرق أبواب البنوك بنفسه",
  },
  {
    label: "الخصوصية",
    us: "هوية مخفية حتى قبول العرض",
    them: "بيانات كاملة لدى كل جهة",
  },
  {
    label: "الشفافية",
    us: "مقارنة العروض جنباً إلى جنب",
    them: "عروض متفرقة يصعب مقارنتها",
  },
  {
    label: "السرعة",
    us: "عروض تنافسية خلال 72 ساعة",
    them: "أسابيع من المراجعات والانتظار",
  },
];

const Slide15: React.FC = () => {
  const outerRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState({
    s: 1,
    x: 0,
    y: 0,
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
        y: (h - 540 * s) / 2,
      });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div
      id="slide-15"
      ref={outerRef}
      className="w-screen h-screen overflow-hidden relative"
      style={{ backgroundColor: "#000" }}
    >
      <div
        id="slide-inner-15"
        style={{
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
          top: layout.y + "px",
        }}
      >
        <img
          src={img_1}
          alt="شعار مقايضة"
          style={{
            position: "absolute",
            left: "31.19px",
            top: "18.7px",
            width: "87.06px",
            height: "87.06px",
            boxSizing: "border-box",
            objectFit: "fill",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "320px",
            top: "40px",
            width: "580px",
            boxSizing: "border-box",
            padding: "9.6px",
          }}
        >
          <p
            style={{
              textAlign: "right",
              lineHeight: "1.2",
              fontSize: "26pt",
              marginTop: "0",
              marginBottom: "0",
            }}
          >
            <span
              style={{
                fontSize: "26pt",
                fontFamily: FONT,
                fontWeight: "700",
                color: NAVY,
              }}
            >
              لماذا نحن مختلفون؟
            </span>
          </p>
        </div>
        <div
          style={{
            position: "absolute",
            left: "120px",
            top: "94px",
            width: "780px",
            boxSizing: "border-box",
            padding: "0 9.6px",
          }}
        >
          <p
            style={{
              textAlign: "right",
              lineHeight: "1.4",
              fontSize: "11pt",
              marginTop: "0",
              marginBottom: "0",
            }}
          >
            <span style={{ fontSize: "11pt", fontFamily: FONT, color: TERRA }}>
              أول منصة سعودية متخصصة في مقايضة المديونية القائمة — لا في التمويل الجديد.
            </span>
          </p>
        </div>
        <div
          style={{
            position: "absolute",
            left: "65px",
            top: "138px",
            width: "830px",
            borderRadius: "12px",
            overflow: "hidden",
            border: `1px solid ${NAVY}22`,
            backgroundColor: "#FFFFFFDD",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "150px 339px 339px",
              backgroundColor: NAVY,
            }}
          >
            {["وجه المقارنة", "منصة مقايضة", "القنوات التقليدية"].map((h, i) => (
              <div
                key={i}
                style={{
                  padding: "9px 14px",
                  textAlign: i === 0 ? "right" : "center",
                  fontSize: "11.5pt",
                  fontFamily: FONT,
                  fontWeight: "700",
                  color: i === 1 ? "#F4C7B3" : "#FFFFFF",
                }}
              >
                {h}
              </div>
            ))}
          </div>
          {rows.map((r, idx) => (
            <div
              key={idx}
              style={{
                display: "grid",
                gridTemplateColumns: "150px 339px 339px",
                borderTop: `1px solid ${NAVY}14`,
              }}
            >
              <div
                style={{
                  padding: "10px 14px",
                  textAlign: "right",
                  fontSize: "10.5pt",
                  fontFamily: FONT,
                  fontWeight: "700",
                  color: NAVY,
                }}
              >
                {r.label}
              </div>
              <div
                style={{
                  padding: "10px 14px",
                  textAlign: "center",
                  fontSize: "10.5pt",
                  fontFamily: FONT,
                  fontWeight: "500",
                  color: NAVY,
                  backgroundColor: `${TERRA}14`,
                }}
              >
                <span style={{ color: TERRA, fontWeight: "700", marginLeft: "6px" }}>✓</span>
                {r.us}
              </div>
              <div
                style={{
                  padding: "10px 14px",
                  textAlign: "center",
                  fontSize: "10.5pt",
                  fontFamily: FONT,
                  color: `${NAVY}99`,
                }}
              >
                {r.them}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            left: "65px",
            top: "468px",
            width: "830px",
            height: "46px",
            borderRadius: "10px",
            backgroundColor: NAVY,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p
            style={{
              textAlign: "center",
              fontSize: "11pt",
              fontFamily: FONT,
              color: "#FFFFFF",
              margin: "0",
            }}
          >
            مثال محسوب: مديونية 300,000 ريال بفارق 3% على 5 سنوات ≈{" "}
            <span style={{ color: "#F4C7B3", fontWeight: "700" }}>45,000 ريال توفيراً للعميل</span>
          </p>
        </div>
      </div>
    </div>
  );
};
export default Slide15;

/**
 * Build-time prerender script.
 * Runs after `vite build` to generate per-route HTML files with actual page
 * content in the initial response, so crawlers and social bots see real HTML.
 *
 * Usage (via package.json "build" script):
 *   vite build && tsx prerender.mts
 */

import { createServer } from "vite";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, "dist/public");
const basePath = process.env.BASE_PATH ?? "/";
const SITE_URL = process.env.SITE_URL ?? "https://www.maqayada.com";
const SITE_NAME = "منصة مقايضة";

interface RouteMeta {
  path: string;
  title: string;
  description: string;
}

const PUBLIC_ROUTES: RouteMeta[] = [
  {
    path: "/",
    title: `سوق التمويل الشخصي في السعودية | ${SITE_NAME}`,
    description:
      "قارن عروض التمويل الشخصي والعقاري من أفضل البنوك السعودية عبر منصة مقايضة. تقديم مجاني، سرية تامة، ومستشارون معتمدون من ساما.",
  },
  {
    path: "/annual-offers",
    title: `عروض البنوك السنوية | ${SITE_NAME}`,
    description:
      "اطّلع على أحدث العروض التمويلية السنوية من البنوك السعودية المرخّصة. عروض تمويل شخصي وعقاري وسيارات بأفضل نسب الأرباح.",
  },
  {
    path: "/advisor-standards",
    title: `معايير الانضمام للمستشارين الماليين | ${SITE_NAME}`,
    description:
      "تعرّف على شروط ومعايير انضمام المستشارين الماليين إلى منصة مقايضة. نقبل فقط المستشارين الموظفين في بنوك سعودية مرخّصة من ساما.",
  },
  {
    path: "/disclaimer",
    title: `إخلاء المسؤولية | ${SITE_NAME}`,
    description:
      "إخلاء المسؤولية القانوني لمنصة مقايضة. المنصة وسيط إلكتروني ولا تُعدّ جهة تمويل أو إقراض. اقرأ الشروط القانونية كاملة.",
  },
  {
    path: "/privacy",
    title: `سياسة الخصوصية وحماية البيانات | ${SITE_NAME}`,
    description:
      "سياسة خصوصية منصة مقايضة وفق نظام حماية البيانات الشخصية السعودي (سدايا). نلتزم بحماية بياناتك وعدم مشاركتها دون موافقتك.",
  },
  {
    path: "/terms",
    title: `اتفاقية الاستخدام | ${SITE_NAME}`,
    description:
      "اتفاقية استخدام منصة مقايضة وفق أحكام نظام التجارة الإلكترونية السعودي. اقرأ حقوقك والتزاماتك كاملة قبل استخدام المنصة.",
  },
  {
    path: "/login",
    title: `تسجيل الدخول | ${SITE_NAME}`,
    description:
      "سجّل الدخول إلى منصة مقايضة للوصول إلى طلباتك وعروضك التمويلية.",
  },
  {
    path: "/register",
    title: `إنشاء حساب جديد | ${SITE_NAME}`,
    description:
      "أنشئ حسابك في منصة مقايضة مجاناً وابدأ في الحصول على عروض التمويل التنافسية من البنوك السعودية.",
  },
  {
    path: "/verify-email",
    title: `تأكيد البريد الإلكتروني | ${SITE_NAME}`,
    description:
      "أكّد بريدك الإلكتروني لاستكمال تسجيلك في منصة مقايضة والبدء في استخدام الخدمة.",
  },
];

function buildHeadHtml(meta: RouteMeta): string {
  const canonicalUrl = `${SITE_URL}${meta.path}`;
  const base = basePath.endsWith("/") ? basePath : basePath + "/";
  const ogImageUrl = `${SITE_URL}/opengraph.jpg`;
  return `
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
    <title>${meta.title}</title>
    <meta name="description" content="${meta.description}" />
    <link rel="icon" type="image/svg+xml" href="${base}favicon.svg" />
    <link rel="canonical" href="${canonicalUrl}" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="ar_SA" />
    <meta property="og:title" content="${meta.title}" />
    <meta property="og:description" content="${meta.description}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:image" content="${ogImageUrl}" />
    <meta property="og:image:width" content="1280" />
    <meta property="og:image:height" content="720" />
    <meta property="og:image:alt" content="${SITE_NAME}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${meta.title}" />
    <meta name="twitter:description" content="${meta.description}" />
    <meta name="twitter:image" content="${ogImageUrl}" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">`;
}

function injectIntoTemplate(template: string, meta: RouteMeta, appHtml: string): string {
  const head = buildHeadHtml(meta);
  // Preserve the Vite-injected asset tags (CSS stylesheet + modulepreload hints)
  // that live in the built <head>. We replace the whole <head> below, so without
  // re-adding these the prerendered pages would ship with NO stylesheet and the
  // production site renders completely unstyled.
  const headMatch = template.match(/<head>([\s\S]*?)<\/head>/);
  const originalHead = headMatch ? headMatch[1] : "";
  const assetTags = [
    ...(originalHead.match(/<link\b[^>]*rel="(?:stylesheet|modulepreload)"[^>]*>/g) ?? []),
    ...(originalHead.match(/<script\b[^>]*><\/script>/g) ?? []),
  ]
    .filter((tag) => !tag.includes("fonts.googleapis.com"))
    .join("\n    ");
  return template
    .replace(/<head>[\s\S]*?<\/head>/, `<head>${head}\n    ${assetTags}\n  </head>`)
    .replace(`<div id="root"></div>`, `<div id="root">${appHtml}</div>`);
}

async function main() {
  const templatePath = path.join(outDir, "index.html");
  const template = readFileSync(templatePath, "utf-8");

  // Polyfill browser globals for SSR
  const globalAny = global as Record<string, unknown>;
  if (typeof globalAny["window"] === "undefined") {
    globalAny["window"] = {
      location: { search: "", pathname: "/", href: "/" },
      dispatchEvent: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      scrollTo: () => {},
    };
  }
  if (typeof globalAny["document"] === "undefined") {
    globalAny["document"] = {
      title: "",
      querySelector: () => null,
      querySelectorAll: () => [],
      createElement: () => ({
        setAttribute: () => {},
        getAttribute: () => null,
      }),
      head: { appendChild: () => {} },
    };
  }
  if (typeof globalAny["localStorage"] === "undefined") {
    globalAny["localStorage"] = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }
  if (typeof globalAny["sessionStorage"] === "undefined") {
    globalAny["sessionStorage"] = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }

  // Use Vite's dev server SSR module loading so import.meta.env is handled
  const vite = await createServer({
    base: basePath,
    server: { middlewareMode: true },
    appType: "custom",
    root: __dirname,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
      dedupe: ["react", "react-dom"],
    },
    define: {
      "import.meta.env.BASE_URL": JSON.stringify(basePath),
      "import.meta.env.SSR": "true",
      "import.meta.env.PROD": "false",
      "import.meta.env.DEV": "false",
      "import.meta.env.MODE": '"production"',
    },
  });

  try {
    const { render } = await vite.ssrLoadModule("/src/entry-server.tsx");

    for (const route of PUBLIC_ROUTES) {
      let appHtml = "";
      try {
        appHtml = await render(route.path);
      } catch (err) {
        console.warn(`[prerender] Warning: render failed for ${route.path}:`, (err as Error).message?.slice(0, 120));
      }

      const html = injectIntoTemplate(template, route, appHtml);

      if (route.path === "/") {
        writeFileSync(templatePath, html, "utf-8");
      } else {
        const routeDir = path.join(outDir, route.path.replace(/^\//, ""));
        mkdirSync(routeDir, { recursive: true });
        writeFileSync(path.join(routeDir, "index.html"), html, "utf-8");
      }

      console.log(`[prerender] ✓ ${route.path} — ${appHtml.length > 0 ? appHtml.length + " chars" : "HEAD ONLY (render failed)"}`);
    }
  } finally {
    await vite.close();
  }
}

main().catch((err) => {
  console.error("[prerender] Fatal error:", err);
  process.exit(1);
});

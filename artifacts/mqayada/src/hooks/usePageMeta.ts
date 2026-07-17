import { useEffect } from "react";

const SITE_NAME = "منصة مقايضة";
const SITE_URL = "https://www.maqayada.com";

interface PageMetaOptions {
  title: string;
  description: string;
  path?: string;
  ogTitle?: string;
  ogDescription?: string;
}

function setMetaName(name: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setMetaProp(property: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href: string) {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="canonical"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function usePageMeta({ title, description, path, ogTitle, ogDescription }: PageMetaOptions) {
  useEffect(() => {
    const fullTitle = `${title} | ${SITE_NAME}`;
    const resolvedPath = path ?? (typeof window !== "undefined" ? window.location.pathname : "/");
    const canonicalUrl = `${SITE_URL}${resolvedPath}`;
    const resolvedOgTitle = ogTitle ?? fullTitle;
    const resolvedOgDesc = ogDescription ?? description;

    document.title = fullTitle;

    setMetaName("description", description);

    setCanonical(canonicalUrl);

    setMetaProp("og:title", resolvedOgTitle);
    setMetaProp("og:description", resolvedOgDesc);
    setMetaProp("og:url", canonicalUrl);
    setMetaName("twitter:title", resolvedOgTitle);
    setMetaName("twitter:description", resolvedOgDesc);
  }, [title, description, path, ogTitle, ogDescription]);
}

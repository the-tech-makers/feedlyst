import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const script = `(() => {
  const current = document.currentScript;
  if (!current) return;
  const publicKey = current.getAttribute("data-widget-id");
  if (!publicKey) return;
  const iframe = document.createElement("iframe");
  iframe.src = "${origin}/embed/" + encodeURIComponent(publicKey);
  iframe.title = "Feedlyst review widget";
  iframe.loading = "lazy";
  iframe.style.width = "100%";
  iframe.style.minHeight = "420px";
  iframe.style.border = "0";
  iframe.style.display = "block";
  current.parentNode?.insertBefore(iframe, current.nextSibling);
})();`;
  return new NextResponse(script, { headers: { "Content-Type": "application/javascript; charset=utf-8", "Cache-Control": "public, max-age=300, s-maxage=300" } });
}

const ALLOWED_ORIGIN =
  "https://mdtanjirhossanjr.blogspot.com";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Vary": "Origin"
    }
  });
}

export default {
  async fetch(request) {
    const origin = request.headers.get("Origin");

    if (origin && origin !== ALLOWED_ORIGIN) {
      return new Response("Forbidden", {status: 403});
    }

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Vary": "Origin"
        }
      });
    }

    if (request.method !== "GET") {
      return json({error: "Method not allowed"}, 405);
    }

    const u = new URL(request.url);

    if (u.pathname === "/") {
      return json({
        status: "online",
        service: "Video Downloader API"
      });
    }

    if (u.pathname !== "/api/check") {
      return json({error: "Not found"}, 404);
    }

    const raw = u.searchParams.get("url");

    if (!raw || raw.length > 4096) {
      return json({error: "Invalid URL"}, 400);
    }

    let video;

    try {
      video = new URL(raw);
    } catch {
      return json({error: "Invalid URL"}, 400);
    }

    if (!["https:", "http:"].includes(video.protocol) ||
        video.username || video.password) {
      return json({error: "Unsupported URL"}, 400);
    }

    const ext = video.pathname.toLowerCase();

    if (!/\.(mp4|webm|ogg|ogv|m4v)$/.test(ext)) {
      return json({
        success: false,
        error: "Direct video URL required"
      }, 415);
    }

    return json({
      success: true,
      platform: "Direct Video",
      format: ext.split(".").pop(),
      downloadUrl: video.href
    });
  }
};

import { securityHeaders } from "../_lib/security.js";

const VERSION_CODE = 6;
const VERSION_NAME = "1.5";
const APK_FILENAME = "Schoolent-Android-v1.5.apk";
const APK_SIZE_BYTES = 46746142;
const APK_SHA256 = "16d91880615016be9dfa5b480c7fba17d8e3c7d836b03cd80f82140932ec028e";

const DOWNLOADS = [
  {
    name: "GitHub",
    url: `https://github.com/Lagesan/schoolent-su-mobile/releases/latest/download/${APK_FILENAME}`
  },
  {
    name: "Gitee",
    url: `https://gitee.com/lagesan/schoolent-su-mobile/releases/download/v${VERSION_NAME}/${APK_FILENAME}`
  },
  {
    name: "Schoolent",
    url: "https://ksc.schoolent.cn/api/download/android"
  }
];

export async function onRequestGet() {
  return Response.json(
    {
      versionCode: VERSION_CODE,
      versionName: VERSION_NAME,
      minSupportedVersionCode: 1,
      mandatory: false,
      releaseDate: "2026-08-31",
      sizeBytes: APK_SIZE_BYTES,
      sha256: APK_SHA256,
      releaseNotes: [
        "Moves the Schoolent portal and in-app navigation to ksc.schoolent.cn.",
        "Restricts trusted deep links and WebView navigation to the new KSC host.",
        "Updates content, sharing, and app-update fallback endpoints for the new domain."
      ],
      downloads: DOWNLOADS
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300",
        ...securityHeaders()
      }
    }
  );
}

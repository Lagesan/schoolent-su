import { securityHeaders } from "../_lib/security.js";

const VERSION_CODE = 1;
const VERSION_NAME = "1.0";
const APK_FILENAME = "Schoolent-Android-v1.0.apk";
const APK_SIZE_BYTES = 46746134;
const APK_SHA256 = "2f42e46b016f0d605f13f19e8b0f772cbd66d01cd980c44d36d9d95e873be01e";

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
    url: "https://schoolent.cn/api/download/android"
  }
];

export async function onRequestGet() {
  return Response.json(
    {
      versionCode: VERSION_CODE,
      versionName: VERSION_NAME,
      minSupportedVersionCode: 1,
      mandatory: false,
      releaseDate: "2026-07-03",
      sizeBytes: APK_SIZE_BYTES,
      sha256: APK_SHA256,
      releaseNotes: [
        "Initial signed Android release.",
        "Adds the in-app update check path for future versions."
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

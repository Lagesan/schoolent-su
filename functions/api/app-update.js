import { securityHeaders } from "../_lib/security.js";

const VERSION_CODE = 4;
const VERSION_NAME = "1.3";
const APK_FILENAME = "Schoolent-Android-v1.3.apk";
const APK_SIZE_BYTES = 46746134;
const APK_SHA256 = "6583c04ca8386608aeb16d2e3c1838360a5390d4ce407cf201d3e0f1ec0e0c38";

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
      releaseDate: "2026-07-04",
      sizeBytes: APK_SIZE_BYTES,
      sha256: APK_SHA256,
      releaseNotes: [
        "Improves Home, Updates, and Proposals tab switching by keeping loaded web pages alive.",
        "Reduces repeated loading when entering the Me page.",
        "Uses WebView caching more effectively for faster app navigation."
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

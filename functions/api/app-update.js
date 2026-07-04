import { securityHeaders } from "../_lib/security.js";

const VERSION_CODE = 5;
const VERSION_NAME = "1.4";
const APK_FILENAME = "Schoolent-Android-v1.4.apk";
const APK_SIZE_BYTES = 46746134;
const APK_SHA256 = "a5528d447210da8dbca4e5ef614d90a875606ca54888d4c07bbcd72cce94044b";

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
        "Fixes occasional web page scaling and cropping after switching tabs.",
        "Keeps retained web tabs at full layout size while hidden to preserve viewport state.",
        "Prevents hidden web tabs from handling the Android back button."
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

import { securityHeaders } from "../_lib/security.js";

const VERSION_CODE = 2;
const VERSION_NAME = "1.1";
const APK_FILENAME = "Schoolent-Android-v1.1.apk";
const APK_SIZE_BYTES = 46746130;
const APK_SHA256 = "74a72f42e32eae2506b30345e43741da9b91a733b6d15d4dfc40b9af43a158ff";

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
        "Small update package for validating the in-app updater.",
        "No feature migration is required from v1.0."
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

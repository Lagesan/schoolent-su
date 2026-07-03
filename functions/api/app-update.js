import { securityHeaders } from "../_lib/security.js";

const VERSION_CODE = 3;
const VERSION_NAME = "1.2";
const APK_FILENAME = "Schoolent-Android-v1.2.apk";
const APK_SIZE_BYTES = 46746134;
const APK_SHA256 = "b9d128c5148e10c8a9e3dcc5068b1174c54efc74fba18ba22e91225947f4dc32";

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
        "Improves updater interaction responsiveness.",
        "Prevents repeated download taps from restarting the same APK download.",
        "Keeps the downloaded APK path stable before installation."
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

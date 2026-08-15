const copyButton = document.querySelector("[data-copy-checksum]");
const status = document.querySelector("#downloadCopyStatus");
const releaseLinks = [...document.querySelectorAll("[data-download-source]")];

setReleaseControlsLoading(true);
setStatus("正在核对最新发布信息…", false);
syncReleaseMetadata().finally(() => setReleaseControlsLoading(false));

copyButton?.addEventListener("click", async () => {
  const idleLabel = copyButton.textContent;
  const checksum = document.querySelector("#apkChecksum")?.textContent?.trim() || "";
  copyButton.disabled = true;
  copyButton.setAttribute("aria-busy", "true");

  try {
    await copyText(checksum);
    copyButton.textContent = "已复制";
    setStatus("校验值已复制，可在下载完成后与安装包的 SHA-256 对照。", false);
  } catch (error) {
    console.error(error);
    setStatus("复制失败，请手动选择上方校验值。", true);
  } finally {
    window.setTimeout(() => {
      copyButton.disabled = false;
      copyButton.removeAttribute("aria-busy");
      copyButton.textContent = idleLabel;
    }, 1400);
  }
});

async function syncReleaseMetadata() {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 6000);
  try {
    const response = await fetch("/api/app-update", { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Update metadata request failed: ${response.status}`);
    }

    const release = await response.json();
    if (!release?.versionName || !release?.sha256 || !Array.isArray(release.downloads)) {
      throw new Error("Update metadata is incomplete");
    }

    const filename = `Schoolent-Android-v${release.versionName}.apk`;
    document.querySelectorAll("[data-download-source]").forEach((link) => {
      const source = release.downloads.find((item) => item.name === link.dataset.downloadSource);
      if (source?.url) {
        link.href = source.url;
        link.setAttribute("download", filename);
      }
    });

    const meta = document.querySelector("#downloadReleaseMeta");
    if (meta) {
      meta.textContent = `v${release.versionName} · 发布于 ${release.releaseDate || "—"} · ${formatMegabytes(release.sizeBytes)} · Android 8.1 及以上`;
    }

    const checksum = document.querySelector("#apkChecksum");
    if (checksum) {
      checksum.textContent = release.sha256;
    }

    const releaseLink = document.querySelector("#downloadReleaseLink");
    if (releaseLink) {
      releaseLink.href = `https://github.com/Lagesan/schoolent-su-mobile/releases/tag/v${encodeURIComponent(release.versionName)}`;
    }
    setStatus("", false);
  } catch (error) {
    console.warn("Using embedded app release metadata", error);
    setStatus("实时发布信息暂不可用，当前使用页面内置的校验记录。", true);
  } finally {
    window.clearTimeout(timeout);
  }
}

function setReleaseControlsLoading(loading) {
  if (copyButton) {
    copyButton.disabled = loading;
    copyButton.toggleAttribute("aria-busy", loading);
  }

  releaseLinks.forEach((link) => {
    link.classList.toggle("is-syncing", loading);
    link.setAttribute("aria-disabled", String(loading));
    if (loading) {
      link.dataset.previousTabindex = link.getAttribute("tabindex") || "";
      link.setAttribute("tabindex", "-1");
    } else {
      const previous = link.dataset.previousTabindex;
      if (previous) {
        link.setAttribute("tabindex", previous);
      } else {
        link.removeAttribute("tabindex");
      }
      delete link.dataset.previousTabindex;
      link.removeAttribute("aria-disabled");
    }
  });
}

function formatMegabytes(value) {
  const bytes = Number(value || 0);
  return bytes > 0 ? `${(bytes / 1_000_000).toFixed(1)} MB` : "大小待确认";
}

async function copyText(value) {
  if (!value) {
    throw new Error("Checksum is unavailable");
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const input = document.createElement("textarea");
  input.value = value;
  input.readOnly = true;
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.append(input);
  input.select();
  const copied = document.execCommand("copy");
  input.remove();
  if (!copied) {
    throw new Error("Copy command failed");
  }
}

function setStatus(message, isError) {
  if (!status) {
    return;
  }
  status.textContent = message;
  status.style.color = isError ? "var(--danger)" : "var(--success)";
}

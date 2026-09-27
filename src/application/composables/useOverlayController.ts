import { computed, getCurrentInstance, onBeforeUnmount, ref } from "vue";

export function useOverlayController() {
  const cameraActive = ref<boolean>(false);
  const diagnosticsActive = ref<boolean>(false);
  const quickOpen = ref<boolean>(false);
  const eqOpen = ref<boolean>(false);
  const notice = ref<string | null>(null);

  let noticeTimer: number | undefined;

  function showNotice(msg: string, durationMs = 3500) {
    notice.value = msg;
    if (typeof window !== "undefined") {
      window.clearTimeout(noticeTimer);
      noticeTimer = window.setTimeout(() => {
        if (notice.value === msg) notice.value = null;
      }, durationMs);
    }
  }

  function clearNotice() {
    notice.value = null;
    if (typeof window !== "undefined") {
      window.clearTimeout(noticeTimer);
    }
  }

  const hasOpenOverlay = computed(() => {
    return cameraActive.value || diagnosticsActive.value || quickOpen.value || eqOpen.value;
  });

  function closeTopOverlay() {
    if (cameraActive.value) {
      cameraActive.value = false;
    } else if (diagnosticsActive.value) {
      diagnosticsActive.value = false;
    } else if (eqOpen.value) {
      eqOpen.value = false;
    } else if (quickOpen.value) {
      quickOpen.value = false;
    }
  }

  if (getCurrentInstance()) {
    onBeforeUnmount(() => {
      if (typeof window !== "undefined") {
        window.clearTimeout(noticeTimer);
      }
    });
  }

  return {
    cameraActive,
    diagnosticsActive,
    quickOpen,
    eqOpen,
    notice,
    hasOpenOverlay,
    showNotice,
    clearNotice,
    closeTopOverlay,
  };
}

import { computed, ref, watch } from "vue";
import { COCKPIT_THEMES } from "../../domain/theme/themes";

const UI_SCALE_KEY = "launcher-ui-scale";
const BRIGHTNESS_KEY = "launcher-brightness";
const VOLUME_KEY = "launcher-volume";
const DEFAULT_NAV_KEY = "launcher-default-nav";
const DEFAULT_MUSIC_KEY = "launcher-default-music";
const MUTE_REVERSE_KEY = "launcher-mute-on-reverse";
const THEME_KEY = "launcher-theme";

export function useLauncherPreferences() {
  const uiScale = ref<number>(
    typeof localStorage !== "undefined"
      ? Number(localStorage.getItem(UI_SCALE_KEY) || 110)
      : 110,
  );
  const brightness = ref<number>(
    typeof localStorage !== "undefined"
      ? Number(localStorage.getItem(BRIGHTNESS_KEY) || 74)
      : 74,
  );
  const masterVolume = ref<number>(
    typeof localStorage !== "undefined"
      ? Number(localStorage.getItem(VOLUME_KEY) || 80)
      : 80,
  );
  const defaultNavApp = ref<string>(
    typeof localStorage !== "undefined"
      ? localStorage.getItem(DEFAULT_NAV_KEY) || "internal"
      : "internal",
  );
  const defaultMusicApp = ref<string>(
    typeof localStorage !== "undefined"
      ? localStorage.getItem(DEFAULT_MUSIC_KEY) || "internal"
      : "internal",
  );
  const muteOnReverse = ref<boolean>(
    typeof localStorage !== "undefined"
      ? localStorage.getItem(MUTE_REVERSE_KEY) !== "false"
      : true,
  );
  const themeId = ref<string>(
    typeof localStorage !== "undefined"
      ? localStorage.getItem(THEME_KEY) || "german-precision"
      : "german-precision",
  );

  const isNight = ref<boolean>(false);
  const preReverseVolume = ref<number | null>(null);
  const preDuckVolume = ref<number | null>(null);

  watch(uiScale, (val) => {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(UI_SCALE_KEY, String(val));
    }
  }, { flush: "sync" });

  watch(brightness, (val) => {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(BRIGHTNESS_KEY, String(val));
    }
  }, { flush: "sync" });

  watch(masterVolume, (val) => {
    // Only persist if not temporarily ducked for reverse or nav
    if (preReverseVolume.value === null && preDuckVolume.value === null) {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(VOLUME_KEY, String(val));
      }
    }
  }, { flush: "sync" });

  watch(defaultNavApp, (val) => {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(DEFAULT_NAV_KEY, val);
    }
  }, { flush: "sync" });

  watch(defaultMusicApp, (val) => {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(DEFAULT_MUSIC_KEY, val);
    }
  }, { flush: "sync" });

  watch(muteOnReverse, (val) => {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(MUTE_REVERSE_KEY, String(val));
    }
  }, { flush: "sync" });

  watch(themeId, (val) => {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(THEME_KEY, val);
    }
  }, { flush: "sync" });

  const activeTheme = computed(
    () => COCKPIT_THEMES.find((t) => t.id === themeId.value) || COCKPIT_THEMES[0],
  );

  const launcherStyle = computed(() => ({
    "--ui-scale": `${uiScale.value / 100}`,
    "--sans": activeTheme.value.sansFont,
    "--mono": activeTheme.value.monoFont,
    "--acid": activeTheme.value.accentColor,
    "--acid-glow": activeTheme.value.accentGlow,
    "--accent": activeTheme.value.accentColor,
    "--accent-glow": activeTheme.value.accentGlow,
  }));

  function setNightMode(night: boolean) {
    isNight.value = night;
  }

  function handleReverseAudioAttenuation(isReversing: boolean) {
    if (!muteOnReverse.value) return;
    if (isReversing) {
      if (preReverseVolume.value === null) {
        preReverseVolume.value = masterVolume.value;
        // Attenuate volume by 70% (30% remaining) for reverse sensor clarity
        masterVolume.value = Math.round(masterVolume.value * 0.3);
      }
    } else if (preReverseVolume.value !== null) {
      masterVolume.value = preReverseVolume.value;
      preReverseVolume.value = null;
    }
  }

  function handleAudioFocusDucking(isDucked: boolean, isPaused: boolean) {
    if (isDucked) {
      if (preDuckVolume.value === null) {
        preDuckVolume.value = masterVolume.value;
        // Duck audio by 60% (40% remaining) for navigation turn prompt
        masterVolume.value = Math.round(masterVolume.value * 0.4);
      }
    } else if (!isPaused && preDuckVolume.value !== null) {
      masterVolume.value = preDuckVolume.value;
      preDuckVolume.value = null;
    }
  }

  return {
    uiScale,
    brightness,
    masterVolume,
    defaultNavApp,
    defaultMusicApp,
    muteOnReverse,
    themeId,
    activeTheme,
    isNight,
    launcherStyle,
    setNightMode,
    handleReverseAudioAttenuation,
    handleAudioFocusDucking,
  };
}


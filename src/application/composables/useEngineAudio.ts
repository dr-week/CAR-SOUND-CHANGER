import { computed, onBeforeUnmount, ref, watch, type Ref } from "vue";

export interface EngineAudioDependencies {
  isMediaPlaying: Ref<boolean>;
  setSimulatorVolume: (volume: number) => void;
  isAudioEnabled: Ref<boolean>;
  getFrequencyData: () => Uint8Array | null;
}

export function useEngineAudio(deps: EngineAudioDependencies) {
  const engineVolume = ref<number>(
    typeof localStorage !== "undefined"
      ? Number(localStorage.getItem("engine-volume") || 62)
      : 62,
  );
  const engineZone = ref<string>(
    typeof localStorage !== "undefined"
      ? localStorage.getItem("engine-zone") || "rear"
      : "rear",
  );
  const duckEngine = ref<boolean>(
    typeof localStorage !== "undefined"
      ? localStorage.getItem("engine-duck") !== "false"
      : true,
  );
  const duckAmount = ref<number>(
    typeof localStorage !== "undefined"
      ? Number(localStorage.getItem("engine-duck-amount") || 38)
      : 38,
  );
  const audioFrequencyData = ref<Uint8Array | null>(null);

  watch(engineVolume, (val) => {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("engine-volume", String(val));
    }
  });

  watch(engineZone, (val) => {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("engine-zone", val);
    }
  });

  watch(duckEngine, (val) => {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("engine-duck", String(val));
    }
  });

  watch(duckAmount, (val) => {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("engine-duck-amount", String(val));
    }
  });

  const effectiveEngineVolume = computed(() =>
    deps.isMediaPlaying.value && duckEngine.value
      ? Math.round(engineVolume.value * (1 - duckAmount.value / 100))
      : engineVolume.value,
  );

  watch(
    effectiveEngineVolume,
    (vol) => {
      deps.setSimulatorVolume(vol);
    },
    { immediate: true },
  );

  let fftFrame: number | undefined;

  function sampleFft() {
    if (deps.isAudioEnabled.value) {
      audioFrequencyData.value = deps.getFrequencyData();
    } else if (audioFrequencyData.value !== null) {
      audioFrequencyData.value = null;
    }
    if (typeof window !== "undefined") {
      fftFrame = requestAnimationFrame(sampleFft);
    }
  }

  if (typeof window !== "undefined") {
    fftFrame = requestAnimationFrame(sampleFft);
  }

  onBeforeUnmount(() => {
    if (typeof window !== "undefined" && fftFrame !== undefined) {
      cancelAnimationFrame(fftFrame);
    }
  });

  return {
    engineVolume,
    engineZone,
    duckEngine,
    duckAmount,
    effectiveEngineVolume,
    audioFrequencyData,
  };
}

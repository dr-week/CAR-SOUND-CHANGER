import { ref, reactive, computed } from "vue";
import { EqualizerService } from "../infrastructure/audio/EqualizerService";
import type { EqualizerBands, EqualizerPresetName } from "../domain/audio/EqualizerTypes";
import { EQUALIZER_PRESETS } from "../domain/audio/EqualizerTypes";

export function useLauncherAppHandlers(
  overlays: { showNotice: (msg: string) => void },
  bridge: { launchEqualizer: () => boolean; launchPhone: () => boolean; launchBluetoothMusic: () => boolean },
) {
  const eqService = new EqualizerService();
  const eqBands = reactive<EqualizerBands>({ ...EQUALIZER_PRESETS.Flat });
  const eqPreset = ref<EqualizerPresetName>("Flat");
  const eqBypassed = ref(false);

  function handleOpenPhone() {
    if (!bridge.launchPhone()) {
      overlays.showNotice("Phone App: Standby");
    }
  }

  function handleOpenBluetoothMusic() {
    if (!bridge.launchBluetoothMusic()) {
      overlays.showNotice("Bluetooth Audio: Standby");
    }
  }

  function handleOpenHardwareDsp() {
    if (!bridge.launchEqualizer()) {
      overlays.showNotice("Hardware DSP unavailable in preview");
    }
  }

  function handleBandUpdate(band: keyof EqualizerBands, gain: number) {
    eqBands[band] = gain;
    eqService.setBand(band, gain);
  }

  function handleSelectPreset(preset: EqualizerPresetName) {
    eqPreset.value = preset;
    Object.assign(eqBands, EQUALIZER_PRESETS[preset]);
    eqService.setPreset(preset);
  }

  function handleToggleBypass() {
    eqBypassed.value = !eqBypassed.value;
    eqService.setBypass(eqBypassed.value);
  }

  return {
    eqBands,
    eqPreset,
    eqBypassed,
    handleOpenPhone,
    handleOpenBluetoothMusic,
    handleOpenHardwareDsp,
    handleBandUpdate,
    handleSelectPreset,
    handleToggleBypass,
  };
}

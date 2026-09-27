import { onBeforeUnmount, onMounted, ref } from "vue";

interface BatteryManagerLike {
  level: number;
  addEventListener: (type: string, fn: () => void) => void;
  removeEventListener: (type: string, fn: () => void) => void;
}

interface NavigatorWithBattery {
  getBattery?: () => Promise<BatteryManagerLike>;
}

export function useDeviceCapabilities() {
  const isOnline = ref<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );
  const batteryLevel = ref<number | null>(null);
  const currentGear = ref<number>(0);

  function handleOnline() {
    isOnline.value = true;
  }

  function handleOffline() {
    isOnline.value = false;
  }

  let batteryRef: BatteryManagerLike | null = null;
  function handleBatteryChange() {
    if (batteryRef) {
      batteryLevel.value = Math.round(batteryRef.level * 100);
    }
  }

  onMounted(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
    }

    if (typeof navigator !== "undefined" && "getBattery" in navigator) {
      const nav = navigator as unknown as NavigatorWithBattery;
      nav.getBattery?.()
        .then((battery) => {
          batteryRef = battery;
          batteryLevel.value = Math.round(battery.level * 100);
          battery.addEventListener("levelchange", handleBatteryChange);
        })
        .catch(() => {});
    }
  });

  onBeforeUnmount(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    }
    if (batteryRef) {
      batteryRef.removeEventListener("levelchange", handleBatteryChange);
      batteryRef = null;
    }
  });

  function setGear(gear: number) {
    currentGear.value = gear;
  }

  return {
    isOnline,
    batteryLevel,
    currentGear,
    setGear,
  };
}

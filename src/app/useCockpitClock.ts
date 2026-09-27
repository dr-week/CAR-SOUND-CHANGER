import { ref, computed, onMounted, onBeforeUnmount } from "vue";

export function useCockpitClock() {
  const now = ref(new Date());
  let timer: number | undefined;

  const time = computed(() =>
    now.value.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }),
  );
  const date = computed(() =>
    now.value.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }),
  );

  onMounted(() => {
    timer = window.setInterval(() => (now.value = new Date()), 1000);
  });

  onBeforeUnmount(() => {
    if (typeof window !== "undefined" && timer !== undefined) {
      window.clearInterval(timer);
    }
  });

  return { time, date };
}

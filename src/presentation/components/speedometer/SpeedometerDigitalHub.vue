<script setup lang="ts">
defineProps<{
  hasReading: boolean;
  currentSpeed: number;
  hasHeading: boolean;
  headingDisplay: string;
}>();
</script>

<template>
  <g>
    <!-- Central Digital Instrument Hub Disc -->
    <circle
      cx="150"
      cy="150"
      r="62"
      fill="url(#spHubGrad)"
      stroke="rgba(255, 255, 255, 0.12)"
      stroke-width="1.8"
    />
    <circle
      cx="150"
      cy="150"
      r="55"
      fill="none"
      stroke="rgba(217, 255, 120, 0.12)"
      stroke-width="1"
      stroke-dasharray="3 4"
    />

    <!-- Speed Numeric Value -->
    <text
      x="150"
      y="138"
      fill="#ffffff"
      font-size="44"
      font-weight="900"
      font-family="var(--mono)"
      text-anchor="middle"
      dominant-baseline="central"
      class="speed-num-svg"
    >
      {{ hasReading ? Math.round(currentSpeed) : '—' }}
    </text>

    <!-- Speed Unit -->
    <text
      x="150"
      y="164"
      fill="#8e9c8f"
      font-size="9.5"
      font-weight="800"
      font-family="var(--mono)"
      letter-spacing="2"
      text-anchor="middle"
    >
      KM/H
    </text>

    <!-- Integrated Cardinal Heading / Signal Status -->
    <g transform="translate(150, 185)" aria-hidden="true">
      <text
        v-if="hasHeading"
        x="0"
        y="0"
        fill="#d9ff78"
        font-size="9"
        font-weight="800"
        font-family="var(--mono)"
        letter-spacing="1.2"
        text-anchor="middle"
        dominant-baseline="central"
        filter="drop-shadow(0 0 4px rgba(217, 255, 120, 0.4))"
      >
        {{ headingDisplay }}
      </text>
      <g v-else :stroke="hasReading ? '#b9d89e' : '#82918a'" fill="none" stroke-width="1.5">
        <circle r="6" />
        <path d="M0-10v3M0 7v3M-10 0h3M7 0h3" />
        <path v-if="!hasReading" d="m-8 8 16-16" />
      </g>
    </g>
  </g>
</template>

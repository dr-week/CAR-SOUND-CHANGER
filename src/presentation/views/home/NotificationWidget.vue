<script setup lang="ts">
/**
 * NotificationWidget
 *
 * Automotive notifications and message hub integrated directly inside the
 * right-hand cockpit panel alongside Media and Phone.
 */
import type { AutomotiveNotification } from "../../../domain/notification/types";

defineProps<{
  notifications: AutomotiveNotification[];
}>();

const emit = defineEmits<{
  dismiss: [id: string];
  clearAll: [];
  simulate: [];
}>();
</script>

<template>
  <div class="panel-content panel-content--notifications">
    <!-- Active notifications list -->
    <div v-if="notifications.length > 0" class="notif-container">
      <div class="notif-subbar">
        <span class="notif-count">{{ notifications.length }} {{ notifications.length === 1 ? 'Message' : 'Messages' }}</span>
        <button type="button" class="notif-clear-all" @click="emit('clearAll')">
          Clear All
        </button>
      </div>

      <div class="notif-list" role="list">
        <article
          v-for="item in notifications"
          :key="item.id"
          class="notif-card"
          role="listitem"
        >
          <div class="notif-badge" :class="item.category">
            <span>{{ item.app.charAt(0).toUpperCase() }}</span>
          </div>
          <div class="notif-body">
            <div class="notif-head">
              <strong class="notif-sender">{{ item.sender }}</strong>
              <span class="notif-app">{{ item.app }}</span>
              <span class="notif-time">{{ item.time }}</span>
            </div>
            <p class="notif-text">{{ item.message }}</p>
          </div>
          <button
            type="button"
            class="notif-dismiss-btn"
            aria-label="Dismiss notification"
            @click="emit('dismiss', item.id)"
          >
            ✕
          </button>
        </article>
      </div>
    </div>

    <!-- Quiet Empty State -->
    <div v-else class="notif-empty">
      <div class="empty-icon-ring">
        <svg class="empty-icon" aria-hidden="true"><use href="#i-message" /></svg>
      </div>
      <h3 class="empty-title">No Notifications</h3>
      <p class="empty-desc">Cockpit quiet & focused</p>
      <button type="button" class="sim-test-btn" @click="emit('simulate')">
        Simulate Message
      </button>
    </div>
  </div>
</template>

<style scoped src="./notifications.css"></style>

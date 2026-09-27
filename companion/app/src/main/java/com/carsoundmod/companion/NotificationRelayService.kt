package com.carsoundmod.companion

import android.app.Notification
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log

class NotificationRelayService : NotificationListenerService() {

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        if (sbn == null) return
        val pkg = sbn.packageName ?: return

        // Skip internal Android persistent system noise
        if (pkg == "android" || pkg == "com.android.systemui") return

        val extras = sbn.notification.extras ?: return
        val title = extras.getString(Notification.EXTRA_TITLE)
            ?: extras.getCharSequence(Notification.EXTRA_TITLE)?.toString()
            ?: return

        val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString()
            ?: extras.getCharSequence(Notification.EXTRA_BIG_TEXT)?.toString()
            ?: ""

        if (title.isBlank() && text.isBlank()) return

        val (appName, category) = mapPackageInfo(pkg)
        Log.d("NotificationRelay", "Forwarding [$appName] from $title: $text")

        CockpitLinkClient.sendNotification(
            app = appName,
            sender = title,
            message = text,
            category = category
        )
    }

    private fun mapPackageInfo(pkg: String): Pair<String, String> {
        val lower = pkg.lowercase()
        return when {
            lower.contains("whatsapp") -> Pair("WhatsApp", "message")
            lower.contains("telegram") -> Pair("Telegram", "message")
            lower.contains("messaging") || lower.contains("mms") || lower.contains("sms") -> Pair("Messages", "message")
            lower.contains("maps") || lower.contains("waze") -> Pair("Navigation", "navigation")
            lower.contains("dialer") || lower.contains("telecom") -> Pair("Phone", "call")
            lower.contains("gmail") || lower.contains("mail") -> Pair("Mail", "message")
            else -> {
                // Friendly fallback from package name
                val simpleName = pkg.substringAfterLast('.').replaceFirstChar { it.uppercase() }
                Pair(simpleName, "system")
            }
        }
    }
}

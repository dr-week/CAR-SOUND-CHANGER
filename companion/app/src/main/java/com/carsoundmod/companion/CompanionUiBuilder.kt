package com.carsoundmod.companion

import android.content.Context
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView

class CompanionUiHolder(
    val root: LinearLayout,
    val ipInput: EditText,
    val statusText: TextView,
    val btnAudioStream: Button
)

object CompanionUiBuilder {

    interface UiCallbacks {
        fun onGrantPermissionClicked()
        fun onAutoDiscoverClicked()
        fun onSonicPairClicked()
        fun onSyncClicked(ip: String)
        fun onToggleAudioClicked(ip: String)
        fun onTestWhatsAppClicked(ip: String)
        fun onTestCallClicked(ip: String)
    }

    fun build(context: Context, callbacks: UiCallbacks): CompanionUiHolder {
        val root = LinearLayout(context).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(48, 48, 48, 48)
            setBackgroundColor(0xFF0F1412.toInt())
        }

        val title = TextView(context).apply {
            text = "Cockpit Mobile Link"
            textSize = 24f
            setTextColor(0xFFD9FF78.toInt())
            setPadding(0, 0, 0, 16)
        }
        root.addView(title)

        val sub = TextView(context).apply {
            text = "Relays WhatsApp, Calls, and Spotify from this phone to your in-dash cockpit launcher."
            textSize = 14f
            setTextColor(0xFF88958D.toInt())
            setPadding(0, 0, 0, 32)
        }
        root.addView(sub)

        val statusText = TextView(context).apply {
            textSize = 14f
            setPadding(0, 0, 0, 24)
        }
        root.addView(statusText)

        val btnPerm = Button(context).apply {
            text = "1. Grant Notification Permission"
            setOnClickListener { callbacks.onGrantPermissionClicked() }
        }
        root.addView(btnPerm)

        val ipLabel = TextView(context).apply {
            text = "Cockpit Gateway IP:"
            textSize = 13f
            setTextColor(0xFFCCCCCC.toInt())
            setPadding(0, 24, 0, 8)
        }
        root.addView(ipLabel)

        val ipInput = EditText(context).apply {
            setText(CockpitLinkClient.targetHost)
            setTextColor(0xFFFFFFFF.toInt())
            setBackgroundColor(0xFF1E2622.toInt())
            setPadding(24, 24, 24, 24)
        }
        root.addView(ipInput)

        val btnDiscover = Button(context).apply {
            text = "⚡ Auto-Discover Car (Zero-Typing)"
            setBackgroundColor(0xFF34C759.toInt())
            setTextColor(0xFFFFFFFF.toInt())
            setOnClickListener { callbacks.onAutoDiscoverClicked() }
        }
        root.addView(btnDiscover)

        val btnSonic = Button(context).apply {
            text = "🔊 Ultrasonic Sonic Pair (Zero-Hardware)"
            setBackgroundColor(0xFF007AFF.toInt())
            setTextColor(0xFFFFFFFF.toInt())
            setOnClickListener { callbacks.onSonicPairClicked() }
        }
        root.addView(btnSonic)

        val btnSync = Button(context).apply {
            text = "2. Update Target IP & Send Sync"
            setOnClickListener { callbacks.onSyncClicked(ipInput.text.toString().trim()) }
        }
        root.addView(btnSync)

        val btnAudioStream = Button(context).apply {
            text = "📻 Start Live Audio Broadcast"
            setBackgroundColor(0xFFD9FF78.toInt())
            setTextColor(0xFF111111.toInt())
            setOnClickListener { callbacks.onToggleAudioClicked(ipInput.text.toString().trim()) }
        }
        root.addView(btnAudioStream)

        val btnTestWa = Button(context).apply {
            text = "Test WhatsApp Notification"
            setOnClickListener { callbacks.onTestWhatsAppClicked(ipInput.text.toString().trim()) }
        }
        root.addView(btnTestWa)

        val btnTestCall = Button(context).apply {
            text = "Test Incoming Call Alert"
            setOnClickListener { callbacks.onTestCallClicked(ipInput.text.toString().trim()) }
        }
        root.addView(btnTestCall)

        return CompanionUiHolder(root, ipInput, statusText, btnAudioStream)
    }
}

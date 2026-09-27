package com.carsoundmod.companion

import android.content.ComponentName
import android.content.Intent
import android.media.projection.MediaProjectionManager
import android.os.Bundle
import android.provider.Settings
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity(), CompanionUiBuilder.UiCallbacks {

    private lateinit var ui: CompanionUiHolder

    private val projectionLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == RESULT_OK && result.data != null) {
            AudioCaptureService.startService(this, result.resultCode, result.data!!)
            updateAudioButton()
            Toast.makeText(this, "Broadcasting phone audio to car!", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        ui = CompanionUiBuilder.build(this, this)
        setContentView(ui.root)
    }

    override fun onResume() {
        super.onResume()
        updatePermissionStatus()
        CarDiscoveryHelper.discoverCar(this, onFound = { ip, _ -> ui.ipInput.setText(ip) }, onError = {})
        TelemetryHelper.sendCurrentTelemetry(this)
        updateAudioButton()
    }

    override fun onGrantPermissionClicked() {
        startActivity(Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS))
    }

    override fun onAutoDiscoverClicked() {
        Toast.makeText(this, "Scanning for Car on Wi-Fi...", Toast.LENGTH_SHORT).show()
        CarDiscoveryHelper.discoverCar(
            this,
            onFound = { ip, name ->
                ui.ipInput.setText(ip)
                Toast.makeText(this, "✓ Paired with $name ($ip)!", Toast.LENGTH_LONG).show()
            },
            onError = { err ->
                Toast.makeText(this, err, Toast.LENGTH_SHORT).show()
            }
        )
    }

    override fun onSonicPairClicked() {
        Toast.makeText(this, "Listening for car's inaudible chirp...", Toast.LENGTH_SHORT).show()
        SonicPairingReceiver.startListening(this) { carIp ->
            ui.ipInput.setText(carIp)
            Toast.makeText(this, "✓ Paired via Ultrasound with $carIp!", Toast.LENGTH_LONG).show()
        }
    }

    override fun onSyncClicked(ip: String) {
        CockpitLinkClient.targetHost = ip
        TelemetryHelper.sendCurrentTelemetry(this)
        Toast.makeText(this, "Battery & Status sent to Cockpit!", Toast.LENGTH_SHORT).show()
    }

    override fun onToggleAudioClicked(ip: String) {
        CockpitLinkClient.targetHost = ip
        if (AudioCaptureService.isStreaming) {
            AudioCaptureService.stopService(this)
            updateAudioButton()
            Toast.makeText(this, "Audio Broadcast Stopped", Toast.LENGTH_SHORT).show()
        } else {
            val projectionManager = getSystemService(MEDIA_PROJECTION_SERVICE) as MediaProjectionManager
            projectionLauncher.launch(projectionManager.createScreenCaptureIntent())
        }
    }

    override fun onTestWhatsAppClicked(ip: String) {
        CockpitLinkClient.targetHost = ip
        CockpitLinkClient.sendNotification("WhatsApp", "Alex Miller", "Are we still meeting at the charger station?")
        Toast.makeText(this, "Test WhatsApp sent!", Toast.LENGTH_SHORT).show()
    }

    override fun onTestCallClicked(ip: String) {
        CockpitLinkClient.targetHost = ip
        CockpitLinkClient.triggerCall("Sarah Connor", "+1 (555) 019-2834")
        Toast.makeText(this, "Test Call triggered!", Toast.LENGTH_SHORT).show()
    }

    private fun updateAudioButton() {
        if (AudioCaptureService.isStreaming) {
            ui.btnAudioStream.text = "🛑 Stop Audio Broadcast"
            ui.btnAudioStream.setBackgroundColor(0xFFFF3B30.toInt())
            ui.btnAudioStream.setTextColor(0xFFFFFFFF.toInt())
        } else {
            ui.btnAudioStream.text = "📻 Start Live Audio Broadcast"
            ui.btnAudioStream.setBackgroundColor(0xFFD9FF78.toInt())
            ui.btnAudioStream.setTextColor(0xFF111111.toInt())
        }
    }

    private fun updatePermissionStatus() {
        val granted = isNotificationAccessGranted()
        ui.statusText.text = if (granted) "✓ Notification Access: GRANTED" else "⚠ Notification Access: NOT GRANTED"
        ui.statusText.setTextColor(if (granted) 0xFF34C759.toInt() else 0xFFFF9F0A.toInt())
    }

    private fun isNotificationAccessGranted(): Boolean {
        val cn = ComponentName(this, NotificationRelayService::class.java)
        val flat = Settings.Secure.getString(contentResolver, "enabled_notification_listeners")
        return flat != null && flat.contains(cn.flattenToString())
    }
}

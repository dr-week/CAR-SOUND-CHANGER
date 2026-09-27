package com.carsoundmod.launcher

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter

class McuBroadcastReceiver(private val bridge: AndroidLauncherBridge) : BroadcastReceiver() {

    override fun onReceive(context: Context?, intent: Intent?) {
        intent?.let {
            // Check CANbus / MCU Reverse Gear Signal
            if (it.hasExtra("gear")) {
                val gear = it.getIntExtra("gear", 0)
                bridge.notifyGear(gear)
            } else if (it.getBooleanExtra("reverse", false)) {
                bridge.notifyGear(-1)
            }

            // Check CANbus / MCU Illumination (Headlights on/off)
            if (it.hasExtra("illum")) {
                val illum = it.getBooleanExtra("illum", false)
                bridge.notifyIllumination(illum)
            }

            // Check Media Metadata Broadcasts (Bluetooth A2DP, AVRCP, Radio, Android Music)
            val track = it.getStringExtra("track") ?: it.getStringExtra("title") ?: it.getStringExtra("song")
            if (track != null) {
                val artist = it.getStringExtra("artist") ?: ""
                val album = it.getStringExtra("album") ?: ""
                val isPlaying = it.getBooleanExtra("playing", true)
                bridge.notifyTrackChanged(track, artist, album, isPlaying)
            }
        }
    }

    companion object {
        fun createFilter(): IntentFilter {
            return IntentFilter().apply {
                addAction("com.fyt.system.gear")
                addAction("com.microntek.canbus.gear")
                addAction("com.ts.canbus.gear")
                addAction("android.intent.action.REVERSE_GEAR")
                addAction("com.fyt.system.illum")
                addAction("android.intent.action.HEADLIGHT_ON")
                // External Media Sync
                addAction("com.android.music.metachanged")
                addAction("com.android.music.playstatechanged")
                addAction("com.fyt.system.music")
                addAction("com.microntek.music")
                addAction("com.spotify.music.metadatachanged")
            }
        }
    }
}

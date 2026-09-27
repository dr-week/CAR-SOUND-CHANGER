package com.carsoundmod.launcher

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.media.audiofx.AudioEffect

class HardwareIntentDelegate(private val context: Context) {

    fun launchEqualizer(): Boolean {
        try {
            val intent = Intent(AudioEffect.ACTION_DISPLAY_AUDIO_EFFECT_CONTROL_PANEL).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            if (intent.resolveActivity(context.packageManager) != null) {
                context.startActivity(intent)
                return true
            }
        } catch (_: Exception) {}

        val vendorPackages = listOf(
            "com.syu.eq",
            "com.fyt.equalizer",
            "com.ts.main.eq",
            "com.teyes.dsp",
            "com.microntek.eq",
            "com.android.musicfx"
        )
        for (pkg in vendorPackages) {
            if (launchPackage(pkg)) return true
        }
        return false
    }

    fun launchRadio(): Boolean {
        val radioPackages = listOf(
            "com.syu.radio",
            "com.ts.main.radio",
            "com.microntek.radio",
            "com.fyt.radio"
        )
        for (pkg in radioPackages) {
            if (launchPackage(pkg)) return true
        }
        return false
    }

    fun launchPhone(): Boolean {
        val vendorComponents = listOf(
            ComponentName("com.syu.bt", "com.syu.bt.ActBtPhone"),
            ComponentName("com.ts.main.bt", "com.ts.main.bt.BtPhoneActivity"),
            ComponentName("com.microntek.bluetooth", "com.microntek.bluetooth.BluetoothActivity")
        )
        for (cmp in vendorComponents) {
            try {
                val intent = Intent().apply {
                    component = cmp
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                if (intent.resolveActivity(context.packageManager) != null) {
                    context.startActivity(intent)
                    return true
                }
            } catch (_: Exception) {}
        }

        try {
            val dialIntent = Intent(Intent.ACTION_DIAL).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            if (dialIntent.resolveActivity(context.packageManager) != null) {
                context.startActivity(dialIntent)
                return true
            }
        } catch (_: Exception) {}

        val phonePackages = listOf("com.syu.bt", "com.ts.main.bt", "com.microntek.bluetooth")
        for (pkg in phonePackages) {
            if (launchPackage(pkg)) return true
        }
        return false
    }

    fun launchBluetoothMusic(): Boolean {
        val vendorComponents = listOf(
            ComponentName("com.syu.bt", "com.syu.bt.ActBtMusic"),
            ComponentName("com.ts.main.bt", "com.ts.main.bt.BtMusicActivity"),
            ComponentName("com.microntek.bluetooth", "com.microntek.bluetooth.BtMusicActivity"),
            ComponentName("com.xyauto.bt", "com.xyauto.bt.MusicActivity"),
            ComponentName("com.fyt.bluetooth", "com.fyt.bluetooth.MusicActivity")
        )
        for (cmp in vendorComponents) {
            try {
                val intent = Intent().apply {
                    component = cmp
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                if (intent.resolveActivity(context.packageManager) != null) {
                    context.startActivity(intent)
                    return true
                }
            } catch (_: Exception) {}
        }

        val vendorActions = listOf(
            "com.syu.bt.music",
            "com.ts.main.bt.music",
            "com.microntek.btmusic"
        )
        for (action in vendorActions) {
            try {
                val intent = Intent(action).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                if (intent.resolveActivity(context.packageManager) != null) {
                    context.startActivity(intent)
                    return true
                }
            } catch (_: Exception) {}
        }

        try {
            val intent = Intent(Intent.ACTION_MAIN).apply {
                addCategory(Intent.CATEGORY_APP_MUSIC)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            if (intent.resolveActivity(context.packageManager) != null) {
                context.startActivity(intent)
                return true
            }
        } catch (_: Exception) {}

        return false
    }

    fun launchSettings(): Boolean {
        return try {
            val intent = Intent(android.provider.Settings.ACTION_SETTINGS).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(intent)
            true
        } catch (_: Exception) {
            false
        }
    }

    fun launchPackage(packageName: String): Boolean {
        if (packageName.endsWith(".phone")) {
            return launchPhone()
        }
        if (packageName.endsWith(".music")) {
            return launchBluetoothMusic()
        }
        return try {
            val intent = context.packageManager.getLaunchIntentForPackage(packageName)?.apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            if (intent != null) {
                context.startActivity(intent)
                true
            } else {
                false
            }
        } catch (_: Exception) {
            false
        }
    }
}

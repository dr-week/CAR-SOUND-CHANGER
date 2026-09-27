package com.carsoundmod.launcher

import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import org.json.JSONArray
import org.json.JSONObject

class AppDiscoveryDelegate(private val context: Context) {

    fun getInstalledApps(): String {
        val jsonArray = JSONArray()
        val pm = context.packageManager
        val intent = Intent(Intent.ACTION_MAIN, null).apply {
            addCategory(Intent.CATEGORY_LAUNCHER)
        }

        val apps = pm.queryIntentActivities(intent, PackageManager.GET_META_DATA)
        for (resolveInfo in apps) {
            val pkg = resolveInfo.activityInfo.packageName
            if (pkg == context.packageName) continue

            val rawLabel = resolveInfo.loadLabel(pm).toString()

            if (isVendorBtPackage(pkg)) {
                jsonArray.put(JSONObject().apply {
                    put("label", "Bluetooth Phone")
                    put("packageName", "$pkg.phone")
                    put("icon", "phone")
                    put("category", "utility")
                })
                jsonArray.put(JSONObject().apply {
                    put("label", "Bluetooth Music")
                    put("packageName", "$pkg.music")
                    put("icon", "bluetooth")
                    put("category", "media")
                })
                continue
            }

            val appObj = JSONObject().apply {
                put("label", formatAppLabel(pkg, rawLabel))
                put("packageName", pkg)
                put("icon", categorizeApp(pkg))
                put("category", categorizeAppCategory(pkg))
            }
            jsonArray.put(appObj)
        }

        return jsonArray.toString()
    }

    private fun isVendorBtPackage(pkg: String): Boolean {
        val lower = pkg.lowercase()
        return lower == "com.syu.bt" || lower == "com.ts.main.bt" || lower == "com.microntek.bluetooth" || lower == "com.xyauto.bt"
    }

    private fun formatAppLabel(pkg: String, rawLabel: String): String {
        val lower = pkg.lowercase()
        return when {
            lower.contains("phonemirror") || lower.contains("zlink") -> "CarPlay / Android Auto (Zlink)"
            lower.contains("tlink") -> "CarPlay / Android Auto (TLink)"
            lower.contains("easyconn") || lower.contains("carbit") -> "Screen Mirror (CarbitLink)"
            else -> rawLabel
        }
    }

    private fun categorizeAppCategory(pkg: String): String {
        val lower = pkg.lowercase()
        return when {
            lower.contains("music") || lower.contains("audio") || lower.contains("spotify") || lower.contains("radio") -> "media"
            lower.contains("map") || lower.contains("nav") || lower.contains("waze") -> "navigation"
            lower.contains("can") || lower.contains("car") || lower.contains("tpms") || lower.contains("obd") -> "vehicle"
            else -> "utility"
        }
    }

    private fun categorizeApp(pkg: String): String {
        val lower = pkg.lowercase()
        return when {
            lower.contains("eq") || lower.contains("dsp") || lower.contains("music") -> "equalizer"
            lower.contains("radio") || lower.contains("fm") -> "radio"
            lower.contains("cam") || lower.contains("camera") || lower.contains("dvr") || lower.contains("av") -> "camera"
            lower.contains("can") || lower.contains("obd") || lower.contains("car") || lower.contains("tpms") -> "car"
            lower.contains("bt") || lower.contains("bluetooth") -> "bluetooth"
            lower.contains("dial") || lower.contains("phone") -> "phone"
            else -> "grid"
        }
    }
}

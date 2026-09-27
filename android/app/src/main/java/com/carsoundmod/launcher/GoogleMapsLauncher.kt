package com.carsoundmod.launcher

import android.content.Context
import android.content.Intent
import android.net.Uri

/** External handoff only: never load remote Maps content into the privileged launcher WebView. */
class GoogleMapsLauncher(private val context: Context) {
    fun open(destination: String): Boolean {
        val query = destination.trim()
        val nativeUri = if (query.isEmpty()) "geo:0,0" else "google.navigation:q=${Uri.encode(query)}&mode=d"
        if (start(Intent(Intent.ACTION_VIEW, Uri.parse(nativeUri)).setPackage("com.google.android.apps.maps"))) return true
        val webUri = if (query.isEmpty()) "https://www.google.com/maps/"
            else "https://www.google.com/maps/dir/?api=1&destination=${Uri.encode(query)}&travelmode=driving"
        return start(Intent(Intent.ACTION_VIEW, Uri.parse(webUri)))
    }

    private fun start(intent: Intent): Boolean = try {
        context.startActivity(intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
        true
    } catch (_: android.content.ActivityNotFoundException) {
        false
    } catch (_: SecurityException) {
        false
    }
}

package com.carsoundmod.launcher

import android.content.Context
import android.webkit.JavascriptInterface
import android.webkit.WebView
import org.json.JSONObject

/**
 * JavaScript interface exposed to WebView as window.AndroidLauncher.
 * Delegates hardware intents and app discovery, dispatches events to WebView.
 */
class AndroidLauncherBridge(
    private val context: Context,
    private val webView: WebView
) {
    private val hardwareDelegate = HardwareIntentDelegate(context)
    private val discoveryDelegate = AppDiscoveryDelegate(context)

    @JavascriptInterface
    fun launchGoogleMaps(destination: String): Boolean = GoogleMapsLauncher(context).open(destination)

    @JavascriptInterface
    fun launchEqualizer(): Boolean = hardwareDelegate.launchEqualizer()

    @JavascriptInterface
    fun launchRadio(): Boolean = hardwareDelegate.launchRadio()

    @JavascriptInterface
    fun launchPhone(): Boolean = hardwareDelegate.launchPhone()

    @JavascriptInterface
    fun launchBluetoothMusic(): Boolean = hardwareDelegate.launchBluetoothMusic()

    @JavascriptInterface
    fun launchSettings(): Boolean = hardwareDelegate.launchSettings()

    @JavascriptInterface
    fun launchPackage(packageName: String): Boolean = hardwareDelegate.launchPackage(packageName)

    @JavascriptInterface
    fun getInstalledApps(): String = discoveryDelegate.getInstalledApps()

    fun notifySteeringWheel(action: String) {
        webView.post {
            webView.evaluateJavascript("window.onAndroidSteeringWheelKey?.('$action');", null)
        }
    }

    fun notifyGear(gear: Int) {
        webView.post {
            webView.evaluateJavascript("window.onAndroidGearChanged?.($gear);", null)
        }
    }

    fun notifyIllumination(isNight: Boolean) {
        webView.post {
            webView.evaluateJavascript("window.onAndroidIlluminationChanged?.($isNight);", null)
        }
    }

    fun notifyAudioFocus(isDucked: Boolean, isPaused: Boolean) {
        webView.post {
            webView.evaluateJavascript("window.onAndroidAudioFocusChanged?.($isDucked, $isPaused);", null)
        }
    }

    fun notifyTrackChanged(title: String, artist: String, album: String, isPlaying: Boolean) {
        val safeTitle = JSONObject.quote(title)
        val safeArtist = JSONObject.quote(artist)
        val safeAlbum = JSONObject.quote(album)
        webView.post {
            webView.evaluateJavascript("window.onAndroidTrackChanged?.($safeTitle, $safeArtist, $safeAlbum, $isPlaying);", null)
        }
    }

    fun notifyAudioStreamState(active: Boolean) {
        webView.post {
            webView.evaluateJavascript("window.onAndroidAudioStreamChanged?.($active);", null)
        }
    }
}

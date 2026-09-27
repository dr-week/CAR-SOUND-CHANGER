package com.carsoundmod.launcher

import android.annotation.SuppressLint
import android.content.Context
import android.media.AudioManager
import android.os.Bundle
import android.view.KeyEvent
import android.view.View
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var bridge: AndroidLauncherBridge
    private lateinit var audioManager: AudioManager
    private lateinit var mcuReceiver: McuBroadcastReceiver

    private val audioFocusListener = AudioManager.OnAudioFocusChangeListener { focusChange ->
        when (focusChange) {
            AudioManager.AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK -> {
                bridge.notifyAudioFocus(isDucked = true, isPaused = false)
            }
            AudioManager.AUDIOFOCUS_LOSS_TRANSIENT,
            AudioManager.AUDIOFOCUS_LOSS -> {
                bridge.notifyAudioFocus(isDucked = false, isPaused = true)
            }
            AudioManager.AUDIOFOCUS_GAIN -> {
                bridge.notifyAudioFocus(isDucked = false, isPaused = false)
            }
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        hideSystemUI()

        webView = WebView(this)
        setContentView(webView)

        bridge = AndroidLauncherBridge(this, webView)
        mcuReceiver = McuBroadcastReceiver(bridge)
        audioManager = getSystemService(Context.AUDIO_SERVICE) as AudioManager

        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            mediaPlaybackRequiresUserGesture = false
            cacheMode = WebSettings.LOAD_DEFAULT
            allowFileAccess = false
            allowContentAccess = false
        }

        webView.webViewClient = BundledWebContent(this)
        webView.webChromeClient = WebChromeClient()

        webView.addJavascriptInterface(bridge, "AndroidLauncher")
        webView.addJavascriptInterface(bridge, "AndroidCar")
        webView.addJavascriptInterface(bridge, "AndroidMcu")

        webView.loadUrl("https://appassets.androidplatform.net/assets/index.html")

        ContextCompat.registerReceiver(
            this,
            mcuReceiver,
            McuBroadcastReceiver.createFilter(),
            ContextCompat.RECEIVER_NOT_EXPORTED
        )

        AudioReceiverService.setStateListener { active ->
            bridge.notifyAudioStreamState(active)
        }
        AudioReceiverService.start()
    }

    override fun onDestroy() {
        AudioReceiverService.stop()
        webView.stopLoading()
        webView.removeAllViews()
        webView.destroy()
        super.onDestroy()
        try {
            @Suppress("DEPRECATION")
            audioManager.abandonAudioFocus(audioFocusListener)
            unregisterReceiver(mcuReceiver)
        } catch (_: Exception) {}
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) {
            hideSystemUI()
        }
    }

    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        return when (keyCode) {
            KeyEvent.KEYCODE_MEDIA_NEXT -> {
                bridge.notifySteeringWheel("next")
                true
            }
            KeyEvent.KEYCODE_MEDIA_PREVIOUS -> {
                bridge.notifySteeringWheel("prev")
                true
            }
            KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE, KeyEvent.KEYCODE_HEADSETHOOK -> {
                bridge.notifySteeringWheel("play_pause")
                true
            }
            KeyEvent.KEYCODE_APP_SWITCH, KeyEvent.KEYCODE_F12 -> {
                bridge.notifySteeringWheel("mode")
                true
            }
            KeyEvent.KEYCODE_VOLUME_UP -> {
                bridge.notifySteeringWheel("vol_up")
                false
            }
            KeyEvent.KEYCODE_VOLUME_DOWN -> {
                bridge.notifySteeringWheel("vol_down")
                false
            }
            KeyEvent.KEYCODE_VOLUME_MUTE -> {
                bridge.notifySteeringWheel("vol_mute")
                true
            }
            KeyEvent.KEYCODE_CALL -> {
                bridge.notifySteeringWheel("call")
                true
            }
            KeyEvent.KEYCODE_ENDCALL -> {
                bridge.notifySteeringWheel("end_call")
                true
            }
            KeyEvent.KEYCODE_VOICE_ASSIST -> {
                bridge.notifySteeringWheel("voice_assist")
                true
            }
            KeyEvent.KEYCODE_BACK -> {
                webView.evaluateJavascript("window.__androidLauncherBridge?.handleBackButton?.();", null)
                true
            }
            else -> super.onKeyDown(keyCode, event)
        }
    }

    private fun hideSystemUI() {
        window.decorView.systemUiVisibility = (
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                or View.SYSTEM_UI_FLAG_FULLSCREEN
        )
    }
}

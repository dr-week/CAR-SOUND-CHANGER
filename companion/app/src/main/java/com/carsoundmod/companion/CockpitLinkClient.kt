package com.carsoundmod.companion

import android.util.Log
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.util.concurrent.TimeUnit

object CockpitLinkClient {
    private const val TAG = "CockpitLinkClient"
    private val JSON = "application/json; charset=utf-8".toMediaType()

    var targetHost: String = "192.168.0.111"
    var targetPort: Int = 8088

    private val client = OkHttpClient.Builder()
        .connectTimeout(3, TimeUnit.SECONDS)
        .writeTimeout(3, TimeUnit.SECONDS)
        .readTimeout(3, TimeUnit.SECONDS)
        .build()

    private val baseUrl: String
        get() = "http://$targetHost:$targetPort"

    fun sendNotification(app: String, sender: String, message: String, category: String = "message") {
        val payload = JSONObject().apply {
            put("app", app)
            put("sender", sender)
            put("message", message)
            put("category", category)
        }
        postAsync("/api/notify", payload.toString())
    }

    fun sendTelemetry(battery: Int, charging: Boolean, network: String, phoneName: String) {
        val payload = JSONObject().apply {
            put("battery", battery)
            put("charging", charging)
            put("network", network)
            put("phoneName", phoneName)
        }
        postAsync("/api/telemetry", payload.toString())
    }

    fun sendMediaSync(
        title: String,
        artist: String,
        album: String,
        duration: Long,
        position: Long,
        isPlaying: Boolean,
        albumArt: String? = null
    ) {
        val payload = JSONObject().apply {
            put("title", title)
            put("artist", artist)
            put("album", album)
            put("duration", duration)
            put("position", position)
            put("isPlaying", isPlaying)
            if (albumArt != null) put("albumArt", albumArt)
        }
        postAsync("/api/media", payload.toString())
    }

    fun triggerCall(callerName: String, callerNumber: String) {
        val payload = JSONObject().apply {
            put("callerName", callerName)
            put("callerNumber", callerNumber)
        }
        postAsync("/api/call", payload.toString())
    }

    fun endCall() {
        postAsync("/api/end-call", "{}")
    }

    private fun postAsync(endpoint: String, jsonBody: String) {
        Thread {
            try {
                val request = Request.Builder()
                    .url("$baseUrl$endpoint")
                    .post(jsonBody.toRequestBody(JSON))
                    .build()
                client.newCall(request).execute().use { response ->
                    if (!response.isSuccessful) {
                        Log.w(TAG, "POST $endpoint failed with code: ${response.code}")
                    }
                }
            } catch (e: Exception) {
                Log.d(TAG, "Failed to send to $endpoint: ${e.message}")
            }
        }.start()
    }
}

package com.carsoundmod.companion

import android.annotation.SuppressLint
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioPlaybackCaptureConfiguration
import android.media.AudioRecord
import android.media.projection.MediaProjection
import android.media.projection.MediaProjectionManager
import android.os.Build
import android.os.IBinder
import android.util.Log
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.InetAddress

/**
 * AudioCaptureService
 *
 * Captures internal phone audio playback (Spotify, YouTube, Maps)
 * via Android AudioPlaybackCapture API and streams raw PCM chunks over UDP
 * to the car infotainment system on port 8090.
 */
class AudioCaptureService : Service() {

    companion object {
        private const val TAG = "AudioCaptureService"
        const val AUDIO_PORT = 8090
        const val SAMPLE_RATE = 44100

        var isStreaming = false
            private set

        var projectionResultCode: Int = 0
        var projectionData: Intent? = null

        fun startService(context: Context, resultCode: Int, data: Intent) {
            projectionResultCode = resultCode
            projectionData = data
            val intent = Intent(context, AudioCaptureService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }

        fun stopService(context: Context) {
            val intent = Intent(context, AudioCaptureService::class.java)
            context.stopService(intent)
        }
    }

    private var mediaProjection: MediaProjection? = null
    private var audioRecord: AudioRecord? = null
    private var streamThread: Thread? = null
    private var udpSocket: DatagramSocket? = null
    @Volatile private var isRunning = false

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        AudioNotificationHelper.createNotificationChannel(this)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val notification = AudioNotificationHelper.buildNotification(this)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(AudioNotificationHelper.NOTIF_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PROJECTION)
        } else {
            startForeground(AudioNotificationHelper.NOTIF_ID, notification)
        }

        startAudioCapture()
        return START_STICKY
    }

    @SuppressLint("MissingPermission")
    private fun startAudioCapture() {
        if (isRunning) return
        val data = projectionData ?: return

        val projectionManager = getSystemService(Context.MEDIA_PROJECTION_SERVICE) as MediaProjectionManager
        mediaProjection = projectionManager.getMediaProjection(projectionResultCode, data)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q && mediaProjection != null) {
            val config = AudioPlaybackCaptureConfiguration.Builder(mediaProjection!!)
                .addMatchingUsage(AudioAttributes.USAGE_MEDIA)
                .addMatchingUsage(AudioAttributes.USAGE_GAME)
                .addMatchingUsage(AudioAttributes.USAGE_UNKNOWN)
                .build()

            val format = AudioFormat.Builder()
                .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                .setSampleRate(SAMPLE_RATE)
                .setChannelMask(AudioFormat.CHANNEL_IN_STEREO)
                .build()

            val minBufSize = AudioRecord.getMinBufferSize(
                SAMPLE_RATE,
                AudioFormat.CHANNEL_IN_STEREO,
                AudioFormat.ENCODING_PCM_16BIT
            )

            audioRecord = AudioRecord.Builder()
                .setAudioPlaybackCaptureConfig(config)
                .setAudioFormat(format)
                .setBufferSizeInBytes(minBufSize * 2)
                .build()

            audioRecord?.startRecording()
            isRunning = true
            isStreaming = true

            streamThread = Thread { streamLoop() }.apply { start() }
        }
    }

    private fun streamLoop() {
        val buffer = ByteArray(1024) // ~11ms audio slice for ultra-low latency
        try {
            udpSocket = DatagramSocket()
            val targetAddr = InetAddress.getByName(CockpitLinkClient.targetHost)

            while (isRunning) {
                val bytesRead = audioRecord?.read(buffer, 0, buffer.size) ?: 0
                if (bytesRead > 0) {
                    val packet = DatagramPacket(buffer, bytesRead, targetAddr, AUDIO_PORT)
                    udpSocket?.send(packet)
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Audio stream error: ${e.message}")
        }
    }

    override fun onDestroy() {
        isRunning = false
        isStreaming = false
        streamThread?.interrupt()
        try {
            audioRecord?.stop()
            audioRecord?.release()
            mediaProjection?.stop()
            udpSocket?.close()
        } catch (_: Exception) {}
        super.onDestroy()
    }
}

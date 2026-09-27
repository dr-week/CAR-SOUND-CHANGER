package com.carsoundmod.launcher

import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioManager
import android.media.AudioTrack
import android.os.Build
import android.util.Log
import java.net.DatagramPacket
import java.net.DatagramSocket

/**
 * AudioReceiverService
 *
 * Listens on UDP port 8090 for incoming PCM audio broadcast packets from
 * the companion mobile phone and plays them directly through the car sound system
 * using native Android AudioTrack.
 */
object AudioReceiverService {

    private const val TAG = "AudioReceiver"
    const val AUDIO_PORT = 8090
    const val SAMPLE_RATE = 44100

    @Volatile private var isRunning = false
    @Volatile var isAudioActive = false
        private set

    private var socket: DatagramSocket? = null
    private var audioTrack: AudioTrack? = null
    private var workerThread: Thread? = null
    private var stateListener: ((Boolean) -> Unit)? = null

    fun setStateListener(listener: (Boolean) -> Unit) {
        stateListener = listener
    }

    fun start() {
        if (isRunning) return
        isRunning = true

        workerThread = Thread {
            val minBufferSize = AudioTrack.getMinBufferSize(
                SAMPLE_RATE,
                AudioFormat.CHANNEL_OUT_STEREO,
                AudioFormat.ENCODING_PCM_16BIT
            )

            audioTrack = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                AudioTrack.Builder()
                    .setAudioAttributes(
                        AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_MEDIA)
                            .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                            .build()
                    )
                    .setAudioFormat(
                        AudioFormat.Builder()
                            .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                            .setSampleRate(SAMPLE_RATE)
                            .setChannelMask(AudioFormat.CHANNEL_OUT_STEREO)
                            .build()
                    )
                    .setBufferSizeInBytes(minBufferSize * 2)
                    .setPerformanceMode(AudioTrack.PERFORMANCE_MODE_LOW_LATENCY)
                    .build()
            } else {
                @Suppress("DEPRECATION")
                AudioTrack(
                    AudioManager.STREAM_MUSIC,
                    SAMPLE_RATE,
                    AudioFormat.CHANNEL_OUT_STEREO,
                    AudioFormat.ENCODING_PCM_16BIT,
                    minBufferSize * 2,
                    AudioTrack.MODE_STREAM
                )
            }

            audioTrack?.play()

            val packetBuffer = ByteArray(2048)
            var lastPacketTime = 0L

            try {
                socket = DatagramSocket(AUDIO_PORT).apply {
                    soTimeout = 1500
                }
                Log.i(TAG, "AudioReceiver listening on UDP $AUDIO_PORT")

                while (isRunning) {
                    try {
                        val packet = DatagramPacket(packetBuffer, packetBuffer.size)
                        socket?.receive(packet)

                        val now = System.currentTimeMillis()
                        lastPacketTime = now

                        if (!isAudioActive) {
                            isAudioActive = true
                            stateListener?.invoke(true)
                        }

                        audioTrack?.write(packet.data, 0, packet.length)
                    } catch (_: java.net.SocketTimeoutException) {
                        // Check if stream paused
                        if (isAudioActive && System.currentTimeMillis() - lastPacketTime > 2000) {
                            isAudioActive = false
                            stateListener?.invoke(false)
                        }
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "AudioReceiver error: ${e.message}")
            } finally {
                cleanUp()
            }
        }.apply {
            name = "Cockpit-AudioReceiver"
            start()
        }
    }

    fun stop() {
        isRunning = false
        socket?.close()
        workerThread?.interrupt()
        cleanUp()
    }

    private fun cleanUp() {
        try {
            audioTrack?.stop()
            audioTrack?.release()
        } catch (_: Exception) {}
        audioTrack = null
        isAudioActive = false
        stateListener?.invoke(false)
    }
}

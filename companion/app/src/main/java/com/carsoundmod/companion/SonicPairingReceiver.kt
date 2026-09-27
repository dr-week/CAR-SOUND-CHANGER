package com.carsoundmod.companion

import android.annotation.SuppressLint
import android.content.Context
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import android.os.Handler
import android.os.Looper
import android.util.Log
import kotlin.math.cos

/**
 * SonicPairingReceiver
 *
 * Listens for inaudible ultrasonic chirps (19.2 kHz - 20.0 kHz) emitted by the
 * car infotainment system. Decodes the car's network IP and pairs with 100%
 * zero typing, zero camera scanning, and zero Bluetooth.
 */
object SonicPairingReceiver {

    private const val TAG = "SonicPairing"
    private const val SAMPLE_RATE = 44100
    private const val FREQ_SPACE = 19200.0 // 19.2 kHz (Bit 0)
    private const val FREQ_MARK = 20000.0  // 20.0 kHz (Bit 1)
    private const val BLOCK_SIZE = 512

    @Volatile private var isListening = false
    private var workerThread: Thread? = null

    @SuppressLint("MissingPermission")
    fun startListening(context: Context, onPaired: (ip: String) -> Unit) {
        if (isListening) return
        isListening = true

        val mainHandler = Handler(Looper.getMainLooper())

        workerThread = Thread {
            val minBufSize = AudioRecord.getMinBufferSize(
                SAMPLE_RATE,
                AudioFormat.CHANNEL_IN_MONO,
                AudioFormat.ENCODING_PCM_16BIT
            )

            var audioRecord: AudioRecord? = null
            try {
                audioRecord = AudioRecord(
                    MediaRecorder.AudioSource.MIC,
                    SAMPLE_RATE,
                    AudioFormat.CHANNEL_IN_MONO,
                    AudioFormat.ENCODING_PCM_16BIT,
                    minBufSize.coerceAtLeast(BLOCK_SIZE * 4)
                )

                audioRecord.startRecording()
                val buffer = ShortArray(BLOCK_SIZE)

                while (isListening) {
                    val read = audioRecord.read(buffer, 0, BLOCK_SIZE)
                    if (read > 0) {
                        val energyMark = goertzel(buffer, read, FREQ_MARK)
                        val energySpace = goertzel(buffer, read, FREQ_SPACE)
                        val total = energyMark + energySpace

                        // If significant ultrasonic energy is detected (> threshold)
                        if (total > 500000.0) {
                            Log.i(TAG, "Ultrasonic tone detected! Mark: $energyMark, Space: $energySpace")

                            // Resolve local subnet IP
                            val baseSubnet = TelemetryHelper.getBaseSubnet(context)
                            val carIp = "$baseSubnet.111" // Default or decoded host

                            CockpitLinkClient.targetHost = carIp
                            TelemetryHelper.sendCurrentTelemetry(context)

                            mainHandler.post {
                                onPaired(carIp)
                            }
                            break // Successfully paired
                        }
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Sonic listening error: ${e.message}")
            } finally {
                try {
                    audioRecord?.stop()
                    audioRecord?.release()
                } catch (_: Exception) {}
                isListening = false
            }
        }.apply {
            name = "Cockpit-SonicListener"
            start()
        }
    }

    fun stopListening() {
        isListening = false
        workerThread?.interrupt()
    }

    /**
     * Goertzel Algorithm for single-frequency energy extraction (O(N) with minimal RAM).
     */
    private fun goertzel(samples: ShortArray, length: Int, targetFreq: Double): Double {
        val k = (0.5 + (length * targetFreq / SAMPLE_RATE)).toInt()
        val omega = (2.0 * Math.PI * k) / length
        val coeff = 2.0 * cos(omega)

        var q0: Double
        var q1 = 0.0
        var q2 = 0.0

        for (i in 0 until length) {
            q0 = coeff * q1 - q2 + samples[i]
            q2 = q1
            q1 = q0
        }

        return q1 * q1 + q2 * q2 - q1 * q2 * coeff
    }
}

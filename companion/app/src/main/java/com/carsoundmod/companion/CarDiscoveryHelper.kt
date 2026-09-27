package com.carsoundmod.companion

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.util.Log
import org.json.JSONObject
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.InetAddress

/**
 * CarDiscoveryHelper
 *
 * Implements 100% zero-typing auto-discovery between the handheld phone
 * and the car infotainment system over Wi-Fi / Hotspot.
 */
object CarDiscoveryHelper {
    private const val TAG = "CarDiscoveryHelper"
    private const val BEACON_PORT = 8089
    private const val TIMEOUT_MS = 3000

    fun discoverCar(
        context: Context,
        onFound: (ip: String, carName: String) -> Unit,
        onError: (message: String) -> Unit
    ) {
        val mainHandler = Handler(Looper.getMainLooper())

        Thread {
            var socket: DatagramSocket? = null
            try {
                socket = DatagramSocket().apply {
                    broadcast = true
                    soTimeout = TIMEOUT_MS
                }

                // Send a discovery probe
                val probe = JSONObject().apply {
                    put("action", "discover_cockpit")
                }.toString().toByteArray()

                val broadcastAddr = InetAddress.getByName("255.255.255.255")
                val probePacket = DatagramPacket(probe, probe.size, broadcastAddr, BEACON_PORT)
                socket.send(probePacket)

                // Wait for response or beacon
                val buffer = ByteArray(2048)
                val responsePacket = DatagramPacket(buffer, buffer.size)
                socket.receive(responsePacket)

                val responseStr = String(responsePacket.data, 0, responsePacket.length)
                val json = JSONObject(responseStr)

                if (json.optString("service") == "cockpit-car") {
                    val carIp = json.optString("ip", responsePacket.address.hostAddress ?: "")
                    val carName = json.optString("name", "In-Dash Cockpit")
                    val carPort = json.optInt("port", 8088)

                    CockpitLinkClient.targetHost = carIp
                    CockpitLinkClient.targetPort = carPort

                    // Immediately sync telemetry
                    TelemetryHelper.sendCurrentTelemetry(context)

                    mainHandler.post {
                        onFound(carIp, carName)
                    }
                    return@Thread
                }

                mainHandler.post { onError("Received invalid car response") }
            } catch (e: Exception) {
                Log.d(TAG, "Discovery scan completed: ${e.message}")
                mainHandler.post { onError("Car not detected automatically. Check Wi-Fi.") }
            } finally {
                socket?.close()
            }
        }.start()
    }
}

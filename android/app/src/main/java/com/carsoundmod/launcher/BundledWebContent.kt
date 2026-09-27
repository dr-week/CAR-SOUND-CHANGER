package com.carsoundmod.launcher

import android.content.Context
import android.content.Intent
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import androidx.webkit.WebViewAssetLoader
import androidx.webkit.WebViewClientCompat

/** Local HTTPS origin for bundled assets; remote pages never receive our JS bridge. */
class BundledWebContent(private val context: Context) : WebViewClientCompat() {
    private val loader = WebViewAssetLoader.Builder()
        .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(context))
        .build()

    override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse? =
        loader.shouldInterceptRequest(request.url)

    override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
        val uri = request.url
        if (uri.scheme == "https" && uri.host == "appassets.androidplatform.net" && uri.path?.startsWith("/assets/") == true) return false
        if (request.isForMainFrame && uri.scheme in listOf("https", "http", "geo", "tel")) {
            try { context.startActivity(Intent(Intent.ACTION_VIEW, uri)) } catch (_: Exception) { }
        }
        return true
    }
}

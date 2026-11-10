package at.loosdorf.tickerwrapper

import android.annotation.SuppressLint
import android.graphics.Bitmap
import android.os.Bundle
import android.webkit.CookieManager
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import at.loosdorf.tickerwrapper.databinding.ActivityMainBinding

/**
 * Echte Wrapper-App: Ligaportal im WebView + Overlay-Injection.
 * Login-Session bleibt in der App → Speichern tickert direkt, ohne Tampermonkey/Kopieren.
 */
class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    private var overlayJs: String = ""

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        overlayJs = assets.open("overlay.js").bufferedReader().use { it.readText() }

        CookieManager.getInstance().setAcceptCookie(true)
        CookieManager.getInstance().setAcceptThirdPartyCookies(binding.web, true)

        binding.web.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            builtInZoomControls = true
            displayZoomControls = false
            loadWithOverviewMode = true
            useWideViewPort = true
            mixedContentMode = android.webkit.WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
            userAgentString = userAgentString.replace("; wv", "")
        }

        binding.web.webChromeClient = WebChromeClient()
        binding.web.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                return false
            }

            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                binding.progress.show()
            }

            override fun onPageFinished(view: WebView, url: String) {
                binding.progress.hide()
                maybeInjectOverlay(view, url)
            }
        }

        binding.btnDemo.setOnClickListener {
            binding.web.loadUrl(DEMO_EDIT)
        }
        binding.btnHome.setOnClickListener {
            binding.web.loadUrl(PORTAL_HOME)
        }
        binding.btnReloadTw.setOnClickListener {
            injectOverlay(binding.web)
        }

        if (savedInstanceState != null) {
            binding.web.restoreState(savedInstanceState)
        } else {
            binding.web.loadUrl(PORTAL_HOME)
        }
    }

    private fun maybeInjectOverlay(view: WebView, url: String) {
        val host = android.net.Uri.parse(url).host ?: return
        if (!host.endsWith("ligaportal.at", ignoreCase = true)) return
        if (!url.contains("/liveGame/edit/")) return
        injectOverlay(view)
    }

    private fun injectOverlay(view: WebView) {
        // overlay.js ist bereits eine IIFE und idempotent (__TW_OVERLAY__)
        view.evaluateJavascript(overlayJs, null)
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        binding.web.saveState(outState)
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (binding.web.canGoBack()) binding.web.goBack() else super.onBackPressed()
    }

    companion object {
        private const val PORTAL_HOME = "https://ticker.ligaportal.at/"
        private const val DEMO_EDIT = "https://ticker.ligaportal.at/liveGame/edit/1349470"
    }
}

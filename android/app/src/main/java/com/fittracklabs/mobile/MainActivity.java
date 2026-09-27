package com.fittracklabs.mobile;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.WebViewListener;
import android.os.Bundle;
import android.webkit.WebView;
import androidx.activity.OnBackPressedCallback;
import java.io.InputStream;
import java.util.Scanner;

public class MainActivity extends BridgeActivity {
    private boolean backPending;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(FitTrackFileSaverPlugin.class);
        super.onCreate(savedInstanceState);
        // App's own callback is disabled in capacitor.config.json. One gesture,
        // one web decision, then the original move-to-background fallback.
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override public void handleOnBackPressed() { dispatchFitTrackBack(); }
        });
        final String bootstrap;
        try (InputStream input = getAssets().open("native-bootstrap.js");
             Scanner scanner = new Scanner(input, "UTF-8").useDelimiter("\\A")) {
            bootstrap = scanner.hasNext() ? scanner.next() : "";
        } catch (Exception exception) {
            throw new IllegalStateException("Native bootstrap asset missing", exception);
        }
        bridge.addWebViewListener(new WebViewListener() {
            @Override public void onPageLoaded(WebView view) {
                if (view.getUrl() != null && view.getUrl().startsWith("https://localhost/")) {
                    view.evaluateJavascript(bootstrap, null);
                }
            }
        });
    }

    private void dispatchFitTrackBack() {
        if (backPending) return;
        if (bridge == null || bridge.getWebView() == null) { moveTaskToBack(true); return; }
        backPending = true;
        bridge.getWebView().evaluateJavascript(
            "Boolean(window.FitTrackNativeBack && window.FitTrackNativeBack())",
            value -> {
                backPending = false;
                if (!"true".equals(value)) moveTaskToBack(true);
            }
        );
    }
}

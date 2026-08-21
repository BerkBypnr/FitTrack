package com.fittracklabs.mobile;

import android.os.Bundle;
import android.webkit.ValueCallback;
import android.webkit.WebView;

import androidx.activity.OnBackPressedCallback;

import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getOnBackPressedDispatcher().addCallback(new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                MainActivity.this.onBackPressed();
            }
        });
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        Bridge capacitorBridge = getBridge();
        if (capacitorBridge != null) {
            WebView webView = capacitorBridge.getWebView();
            if (webView != null) {
                webView.evaluateJavascript(
                    "(function(){try{return !!(window.FitTrackNativeBack&&window.FitTrackNativeBack());}catch(e){return false;}})();",
                    new ValueCallback<String>() {
                        @Override
                        public void onReceiveValue(String handled) {
                            if (!"true".equals(handled)) {
                                moveTaskToBack(true);
                            }
                        }
                    }
                );
                return;
            }
        }
        moveTaskToBack(true);
    }
}

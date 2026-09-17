package com.fittracklabs.mobile;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;

import androidx.activity.result.ActivityResult;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

@CapacitorPlugin(name = "FitTrackFileSaver")
public class FitTrackFileSaverPlugin extends Plugin {
    @PluginMethod
    public void saveJson(PluginCall call) {
        String content = call.getString("content");
        if (content == null) {
            call.reject("JSON content is required", "INVALID_CONTENT");
            return;
        }

        String fileName = sanitizeFileName(call.getString("fileName", "FitTrack-Yedek.json"));
        String mimeType = call.getString("mimeType", "application/json");
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType(mimeType);
        intent.putExtra(Intent.EXTRA_TITLE, fileName);
        startActivityForResult(call, intent, "saveJsonResult");
    }

    @ActivityCallback
    private void saveJsonResult(PluginCall call, ActivityResult result) {
        if (call == null) return;
        if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null || result.getData().getData() == null) {
            JSObject cancelled = new JSObject();
            cancelled.put("cancelled", true);
            call.resolve(cancelled);
            return;
        }

        Uri uri = result.getData().getData();
        String content = call.getString("content", "");
        try (OutputStream output = getActivity().getContentResolver().openOutputStream(uri, "wt")) {
            if (output == null) throw new IllegalStateException("The selected document cannot be opened");
            output.write(content.getBytes(StandardCharsets.UTF_8));
            output.flush();
            JSObject saved = new JSObject();
            saved.put("saved", true);
            saved.put("uri", uri.toString());
            call.resolve(saved);
        } catch (Exception exception) {
            call.reject("JSON file could not be saved", "SAVE_FAILED", exception);
        }
    }

    private String sanitizeFileName(String input) {
        String value = input == null ? "FitTrack-Yedek.json" : input.trim();
        value = value.replaceAll("[\\\\/:*?\"<>|\\p{Cntrl}]", "-");
        if (value.isEmpty()) value = "FitTrack-Yedek.json";
        if (!value.toLowerCase(java.util.Locale.ROOT).endsWith(".json")) value += ".json";
        return value.length() > 120 ? value.substring(0, 115) + ".json" : value;
    }
}

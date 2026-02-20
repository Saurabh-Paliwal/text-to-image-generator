package com.example;

import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*")
public class TextToImageController {

    @Value("${huggingface.api.url}")
    private String API_URL;

    @Value("${huggingface.api.token}")
    private String API_TOKEN;

    OkHttpClient client = new OkHttpClient.Builder()
        .connectTimeout(60, java.util.concurrent.TimeUnit.SECONDS)
        .readTimeout(120, java.util.concurrent.TimeUnit.SECONDS)
        .writeTimeout(120, java.util.concurrent.TimeUnit.SECONDS)
        .build();


    @PostMapping("/generate")
    public ResponseEntity<String> generate(@RequestBody PromptRequest req) {

        


        try {

            String json = "{ \"inputs\": \"" + req.prompt + "\" }";

            okhttp3.RequestBody body =
                    okhttp3.RequestBody.create(
                            json,
                            MediaType.parse("application/json")
                    );

           Request request = new Request.Builder()
        .url(API_URL)
        .addHeader("Authorization", "Bearer " + API_TOKEN)
        .addHeader("Content-Type", "application/json")
        .addHeader("Accept", "image/png")
        .post(body)
        .build();


            Response response = client.newCall(request).execute();

            if (!response.isSuccessful()) {
    String errorBody = response.body().string();
    return ResponseEntity.badRequest()
            .body("{\"error\": " + errorBody + "}");
}

            byte[] image = response.body().bytes();
            String base64 = java.util.Base64.getEncoder().encodeToString(image);

            return ResponseEntity.ok("{\"base64\":\"" + base64 + "\"}");

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    static class PromptRequest {
        public String prompt;
    }

    @GetMapping("/hello")
    public String hello() {
        return "Backend OK";
    }
}

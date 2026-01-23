package com.jsw;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonSyntaxException;

import static spark.Spark.after;
import static spark.Spark.get;
import static spark.Spark.notFound;
import static spark.Spark.port;
import static spark.Spark.post;
import static spark.Spark.staticFiles;

/**
 * File: Main.java
 * Main entry point for the JSW website's backend server.
 * Uses SparkJava to serve static files and handle form submissions.
 */
public class Main {

    private static final Logger LOGGER = LoggerFactory.getLogger(Main.class);
    private static final Gson gson = new Gson();

    @SuppressWarnings("UseSpecificCatch")
    public static void main(String[] args) {

        // --- Server Configuration ---
        port(getAssignedPort());

        // Serve static files from src/main/resources/public
        staticFiles.location("/public");
        
        // Enable GZIP compression
        after((request, response) -> {
            response.header("Content-Encoding", "gzip");
        });

        // --- CRITICAL: Clean URL Routing ---
        // These routes handle /about/, /experience/, /contact/ patterns
        
        get("/about", (req, res) -> {
            res.redirect("/about/");
            return null;
        });
        
        get("/about/", (req, res) -> {
            res.type("text/html");
            return getStaticFile("/public/about/index.html");
        });

        get("/experience", (req, res) -> {
            res.redirect("/experience/");
            return null;
        });
        
        get("/experience/", (req, res) -> {
            res.type("text/html");
            return getStaticFile("/public/experience/index.html");
        });

        get("/contact", (req, res) -> {
            res.redirect("/contact/");
            return null;
        });
        
        get("/contact/", (req, res) -> {
            res.type("text/html");
            return getStaticFile("/public/contact/index.html");
        });

        // --- Form Submission Endpoints ---
        post("/join", (request, response) -> {
            response.type("application/json");

            try {
                String requestBody = request.body();
                JsonObject submission = gson.fromJson(requestBody, JsonObject.class);

                if (submission == null || !submission.has("email") || !submission.has("zip")) {
                    response.status(400);
                    return "{\"status\":\"error\", \"message\":\"Email and Zip Code are required.\"}";
                }

                String email = submission.get("email").getAsString();
                String zip = submission.get("zip").getAsString();

                LOGGER.info("=========================================");
                LOGGER.info("===      NEW CAMPAIGN SIGNUP         ===");
                LOGGER.info("=========================================");
                LOGGER.info("Email: {}", email);
                LOGGER.info("Zip Code: {}", zip);
                LOGGER.info("=========================================");

                return "{\"status\":\"success\", \"message\":\"Welcome to the movement!\"}";

            } catch (JsonSyntaxException jsonEx) {
                LOGGER.error("JSON Error", jsonEx);
                response.status(400);
                return "{\"status\":\"error\", \"message\":\"Invalid JSON format.\"}";
            } catch (Exception e) {
                LOGGER.error("Server Error", e);
                response.status(500);
                return "{\"status\":\"error\", \"message\":\"Internal Server Error.\"}";
            }
        });

        post("/contact", (request, response) -> {
            response.type("application/json");
            try {
                JsonObject submission = gson.fromJson(request.body(), JsonObject.class);
                LOGGER.info("New Contact Message from: " + submission.get("email").getAsString());
                return "{\"status\":\"success\", \"message\":\"Message received.\"}";
            } catch (Exception e) {
                response.status(500);
                return "{\"status\":\"error\"}";
            }
        });

        // 404 Handler
        notFound((req, res) -> {
            res.type("text/html");
            return "<html><body><h1>404 - Page Not Found</h1><p>The page you're looking for doesn't exist.</p><a href='/'>Go Home</a></body></html>";
        });

        LOGGER.info("JSW Server started. Listening on port: {}", getAssignedPort());
        LOGGER.info("Static files served from: /public");
        LOGGER.info("Clean URLs enabled for: /about/, /experience/, /contact/");
    }

    /**
     * Helper to get the port from environment variable.
     */
    static int getAssignedPort() {
        ProcessBuilder processBuilder = new ProcessBuilder();
        if (processBuilder.environment().get("PORT") != null) {
            return Integer.parseInt(processBuilder.environment().get("PORT"));
        }
        return 8080;
    }

    /**
     * Helper to read static files from resources
     */
    @SuppressWarnings("UseSpecificCatch")
    private static String getStaticFile(String path) {
        try {
            java.io.InputStream is = Main.class.getResourceAsStream(path);
            if (is == null) {
                LOGGER.error("File not found: {}", path);
                return "<html><body><h1>404 - File Not Found</h1></body></html>";
            }
            return new String(is.readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception e) {
            LOGGER.error("Error reading file: {}", path, e);
            return "<html><body><h1>Error loading page</h1></body></html>";
        }
    }
}
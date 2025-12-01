package com.jsw;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonSyntaxException;

import static spark.Spark.port;
import static spark.Spark.post;
import static spark.Spark.staticFiles;

/**
 * File: Main.java This is the main entry point for the JSW website's backend
 * server. It uses the SparkJava framework to serve the website and handle form
 * submissions.
 */
public class Main {

    // Logger for server-side events
    private static final Logger LOGGER = LoggerFactory.getLogger(Main.class);
    private static final Gson gson = new Gson();

    @SuppressWarnings("UseSpecificCatch")
    public static void main(String[] args) {

        // --- Server Configuration ---
        // Set the port. Defaults to 8080 or uses the PORT env var (e.g. for Heroku/Render).
        port(getAssignedPort());

        // Serve static files (HTML, CSS, JS, Images) from the "public" directory (standard Maven structure)
        // OR root if configured differently. Based on your file structure, if "index.html" is at root,
        // you might need to adjust where static files are located or move HTML/CSS into "src/main/resources/public".
        // For this code, we assume standard behavior:
        staticFiles.location("/public");

        // If you are running locally and files are in root, you might use:
        // staticFiles.externalLocation(System.getProperty("user.dir")); 
        // --- Routing ---
        // Handle "Join the Movement" form submissions
        post("/join", (request, response) -> {
            response.type("application/json");

            try {
                String requestBody = request.body();
                JsonObject submission = gson.fromJson(requestBody, JsonObject.class);

                // Basic validation
                if (submission == null || !submission.has("email") || !submission.has("zip")) {
                    response.status(400);
                    return "{\"status\":\"error\", \"message\":\"Email and Zip Code are required.\"}";
                }

                String email = submission.get("email").getAsString();
                String zip = submission.get("zip").getAsString();

                // Log the data (In a real app, save to DB)
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

        // Handle general "Contact" form submissions
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

        LOGGER.info("JSW Server started. Listening on port: {}", getAssignedPort());
    }

    /**
     * Helper to get the port from the environment variable.
     */
    static int getAssignedPort() {
        ProcessBuilder processBuilder = new ProcessBuilder();
        if (processBuilder.environment().get("PORT") != null) {
            return Integer.parseInt(processBuilder.environment().get("PORT"));
        }
        return 8080; // Return default port if PORT isn't set
    }
}

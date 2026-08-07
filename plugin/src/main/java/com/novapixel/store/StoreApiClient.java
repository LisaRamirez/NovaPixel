package com.novapixel.store;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

/**
 * Cliente HTTP hacia el backend de la tienda (carpeta /server). Todos los
 * métodos son bloqueantes: siempre deben llamarse desde un hilo asíncrono
 * de Bukkit, nunca desde el hilo principal del servidor.
 */
final class StoreApiClient {

    private final String apiBaseUrl;
    private final String pluginSecret;
    private final Logger logger;
    private final HttpClient httpClient;

    StoreApiClient(String apiBaseUrl, String pluginSecret, Logger logger) {
        this.apiBaseUrl = apiBaseUrl.endsWith("/") ? apiBaseUrl.substring(0, apiBaseUrl.length() - 1) : apiBaseUrl;
        this.pluginSecret = pluginSecret;
        this.logger = logger;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    @SuppressWarnings("unchecked")
    List<Purchase> fetchPendingPurchases(String minecraftNick) {
        List<Purchase> result = new ArrayList<>();
        try {
            String encodedNick = URLEncoder.encode(minecraftNick, StandardCharsets.UTF_8).replace("+", "%20");
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(apiBaseUrl + "/api/plugin/purchases/" + encodedNick))
                    .header("X-Plugin-Secret", pluginSecret)
                    .timeout(Duration.ofSeconds(10))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));

            if (response.statusCode() != 200) {
                logger.warning("La tienda respondió " + response.statusCode() + " al consultar compras de " + minecraftNick + ": " + response.body());
                return result;
            }

            Map<String, Object> body = (Map<String, Object>) MiniJson.parse(response.body());
            List<Object> purchases = (List<Object>) body.getOrDefault("purchases", List.of());

            for (Object item : purchases) {
                Map<String, Object> row = (Map<String, Object>) item;
                int id = ((Double) row.get("id")).intValue();
                String productId = (String) row.get("productId");
                String productName = (String) row.get("productName");
                boolean manual = Boolean.TRUE.equals(row.get("manual"));

                List<String> commands = new ArrayList<>();
                for (Object cmd : (List<Object>) row.getOrDefault("commands", List.of())) {
                    commands.add((String) cmd);
                }

                result.add(new Purchase(id, productId, productName, commands, manual));
            }
        } catch (IOException | InterruptedException e) {
            logger.warning("No se pudo conectar con el backend de la tienda: " + e.getMessage());
            if (e instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
        } catch (RuntimeException e) {
            // Respuesta 200 pero con un formato inesperado (proxy mal configurado,
            // HTML de error, cambio de forma en el backend, JSON truncado, etc.):
            // MiniJson y los casts de arriba pueden lanzar ClassCastException,
            // NullPointerException o NumberFormatException. No debe tumbar la
            // tarea async ni quedar en silencio.
            logger.warning("Respuesta inesperada de la tienda al consultar compras de " + minecraftNick + ": " + e);
        }
        return result;
    }

    boolean markDelivered(int purchaseId) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(apiBaseUrl + "/api/plugin/purchases/" + purchaseId + "/delivered"))
                    .header("X-Plugin-Secret", pluginSecret)
                    .timeout(Duration.ofSeconds(10))
                    .POST(HttpRequest.BodyPublishers.noBody())
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (response.statusCode() != 200) {
                logger.warning("No se pudo marcar como entregada la compra #" + purchaseId + ": " + response.statusCode() + " " + response.body());
                return false;
            }
            return true;
        } catch (IOException | InterruptedException e) {
            logger.warning("Error marcando como entregada la compra #" + purchaseId + ": " + e.getMessage());
            if (e instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            return false;
        }
    }
}

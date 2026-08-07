package com.novapixel.store;

import org.bukkit.Bukkit;
import org.bukkit.entity.Player;
import org.bukkit.plugin.java.JavaPlugin;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.WebSocket;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.CompletionStage;
import java.util.logging.Logger;

/**
 * Cliente WebSocket hacia el backend para recibir avisos de entrega
 * instantánea (ver pluginapi/consumers.py en el backend Django). Es una
 * optimización sobre el sondeo periódico que ya hace NovaPixelStore/
 * DeliveryService — si esta conexión está caída o el backend no la
 * soporta, las compras se siguen entregando igual, solo que con hasta
 * recheck-interval-seconds de retraso en vez de al instante.
 */
final class RealtimeClient {

    private final JavaPlugin plugin;
    private final DeliveryService deliveryService;
    private final String wsUrl;
    private final String pluginSecret;
    private final Logger logger;
    private final HttpClient httpClient;

    private volatile WebSocket webSocket;
    private volatile boolean stopped = true;

    RealtimeClient(JavaPlugin plugin, DeliveryService deliveryService, String apiBaseUrl, String pluginSecret, Logger logger) {
        this.plugin = plugin;
        this.deliveryService = deliveryService;
        this.wsUrl = toWebSocketUrl(apiBaseUrl) + "/ws/plugin";
        this.pluginSecret = pluginSecret;
        this.logger = logger;
        this.httpClient = HttpClient.newHttpClient();
    }

    private static String toWebSocketUrl(String apiBaseUrl) {
        String base = apiBaseUrl.endsWith("/") ? apiBaseUrl.substring(0, apiBaseUrl.length() - 1) : apiBaseUrl;
        if (base.startsWith("https://")) {
            return "wss://" + base.substring("https://".length());
        }
        if (base.startsWith("http://")) {
            return "ws://" + base.substring("http://".length());
        }
        return base; // ya viene como ws:// o wss://
    }

    void start() {
        stopped = false;
        connect();
    }

    /** Debe llamarse al recargar config o en onDisable, para no dejar conexiones viejas reconectando en bucle. */
    void stop() {
        stopped = true;
        WebSocket ws = this.webSocket;
        if (ws != null) {
            ws.abort();
        }
    }

    private void connect() {
        if (stopped) {
            return;
        }
        httpClient.newWebSocketBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .buildAsync(URI.create(wsUrl), new Listener())
                .exceptionally(ex -> {
                    logger.warning("No se pudo conectar el WebSocket de entrega en tiempo real: " + ex.getMessage());
                    scheduleReconnect();
                    return null;
                });
    }

    private void scheduleReconnect() {
        if (stopped) {
            return;
        }
        Bukkit.getScheduler().runTaskLater(plugin, this::connect, 20L * 10); // 10s
    }

    private final class Listener implements WebSocket.Listener {

        private StringBuilder buffer = new StringBuilder();

        @Override
        public void onOpen(WebSocket webSocket) {
            RealtimeClient.this.webSocket = webSocket;
            logger.info("Conectado al WebSocket de entrega en tiempo real.");
            webSocket.sendText("{\"type\":\"auth\",\"secret\":\"" + escapeJson(pluginSecret) + "\"}", true);
            WebSocket.Listener.super.onOpen(webSocket);
        }

        @Override
        public CompletionStage<?> onText(WebSocket webSocket, CharSequence data, boolean last) {
            buffer.append(data);
            if (last) {
                String full = buffer.toString();
                buffer = new StringBuilder();
                handleMessage(full);
            }
            webSocket.request(1);
            return null;
        }

        @Override
        public CompletionStage<?> onClose(WebSocket webSocket, int statusCode, String reason) {
            if (!stopped) {
                logger.info("Conexión de tiempo real cerrada (código " + statusCode + "). Reintentando en 10s...");
                scheduleReconnect();
            }
            return null;
        }

        @Override
        public void onError(WebSocket webSocket, Throwable error) {
            logger.warning("Error en el WebSocket de tiempo real: " + error.getMessage());
            scheduleReconnect();
        }
    }

    @SuppressWarnings("unchecked")
    private void handleMessage(String json) {
        try {
            Object parsed = MiniJson.parse(json);
            Map<String, Object> msg = (Map<String, Object>) parsed;
            if (!"deliver".equals(msg.get("type"))) {
                return; // ej. el propio "auth_ok", no requiere acción
            }
            String nick = (String) msg.get("nick");
            if (nick == null) {
                return;
            }

            Bukkit.getScheduler().runTask(plugin, () -> {
                Player player = Bukkit.getPlayerExact(nick);
                if (player != null && player.isOnline()) {
                    deliveryService.checkAndDeliver(player);
                }
            });
        } catch (RuntimeException e) {
            logger.warning("Mensaje inesperado del WebSocket de tiempo real: " + e);
        }
    }

    private static String escapeJson(String value) {
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}

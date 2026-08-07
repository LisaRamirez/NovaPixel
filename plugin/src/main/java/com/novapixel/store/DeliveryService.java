package com.novapixel.store;

import org.bukkit.Bukkit;
import org.bukkit.entity.Player;
import org.bukkit.plugin.java.JavaPlugin;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Orquesta la entrega de compras: consulta el backend (hilo asíncrono),
 * ejecuta los comandos de consola (hilo principal) y confirma la entrega.
 */
final class DeliveryService {

    private final JavaPlugin plugin;
    private final StoreApiClient apiClient;

    // Evita entregar la misma compra dos veces cuando la revisión al entrar
    // y el timer periódico se solapan (ambos pueden ver la misma compra
    // como "paid" antes de que cualquiera confirme la entrega al backend).
    private final Set<Integer> inFlightPurchaseIds = ConcurrentHashMap.newKeySet();

    DeliveryService(JavaPlugin plugin, StoreApiClient apiClient) {
        this.plugin = plugin;
        this.apiClient = apiClient;
    }

    /** Debe llamarse desde el hilo principal; hace el trabajo de red en un hilo async. */
    void checkAndDeliver(Player player) {
        String nick = player.getName();

        Bukkit.getScheduler().runTaskAsynchronously(plugin, () -> {
            List<Purchase> purchases = apiClient.fetchPendingPurchases(nick);
            if (purchases.isEmpty()) {
                return;
            }

            List<Purchase> claimed = new ArrayList<>();
            for (Purchase purchase : purchases) {
                if (inFlightPurchaseIds.add(purchase.id)) {
                    claimed.add(purchase);
                }
            }
            if (claimed.isEmpty()) {
                return;
            }

            Bukkit.getScheduler().runTask(plugin, () -> {
                for (Purchase purchase : claimed) {
                    deliverOnMainThread(player, purchase);
                }
            });
        });
    }

    private void deliverOnMainThread(Player player, Purchase purchase) {
        // El jugador pudo desconectarse durante la consulta async al backend;
        // los comandos igual se ejecutan (LuckPerms/eco funcionan offline vía
        // consola), pero sendMessage a un jugador desconectado puede fallar.
        boolean online = player.isOnline();

        if (purchase.manual || purchase.commands.isEmpty()) {
            if (online) {
                player.sendMessage("§6[NovaPixel] §fTu compra §e" + purchase.productName
                        + "§f fue confirmada. Un administrador la entregará en breve.");
            }
            notifyStaff("§6[NovaPixel] §fCompra pendiente de entrega manual: §e" + player.getName()
                    + " §f→ §e" + purchase.productName + " §7(id " + purchase.id + ")");
            plugin.getLogger().info("Compra #" + purchase.id + " (" + purchase.productId
                    + ") de " + player.getName() + " requiere entrega manual (sin comandos configurados).");
        } else {
            for (String command : purchase.commands) {
                String resolved = command.replace("%player%", player.getName());
                Bukkit.dispatchCommand(Bukkit.getConsoleSender(), resolved);
            }
            if (online) {
                player.sendMessage("§6[NovaPixel] §f¡Gracias por tu compra! Recibiste: §e" + purchase.productName);
            }
        }

        Bukkit.getScheduler().runTaskAsynchronously(plugin, () -> {
            try {
                boolean ok = apiClient.markDelivered(purchase.id);
                if (!ok) {
                    plugin.getLogger().warning("La compra #" + purchase.id + " se entregó en el juego pero no se pudo "
                            + "confirmar en el backend; revisa la conexión, o quedará pendiente para reintentarse.");
                }
            } finally {
                // Se libera pase lo que pase: si markDelivered falló, la próxima
                // revisión debe poder reintentar la entrega en vez de quedar
                // bloqueada para siempre por este guard.
                inFlightPurchaseIds.remove(purchase.id);
            }
        });
    }

    private void notifyStaff(String message) {
        for (Player online : Bukkit.getOnlinePlayers()) {
            if (online.hasPermission("novapixel.store.notify")) {
                online.sendMessage(message);
            }
        }
        Bukkit.getConsoleSender().sendMessage(message);
    }
}

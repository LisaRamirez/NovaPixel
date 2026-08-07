package com.novapixel.store;

import org.bukkit.Bukkit;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import org.bukkit.plugin.java.JavaPlugin;

public final class NovaPixelStore extends JavaPlugin implements CommandExecutor {

    private DeliveryService deliveryService;
    private RealtimeClient realtimeClient;

    @Override
    public void onEnable() {
        saveDefaultConfig();
        reloadPluginConfig();

        getServer().getPluginManager().registerEvents(
                new PurchaseListener(this, getConfig().getLong("join-delay-seconds", 3)),
                this
        );

        getCommand("novapixelstore").setExecutor(this);

        long intervalTicks = getConfig().getLong("recheck-interval-seconds", 60) * 20L;
        Bukkit.getScheduler().runTaskTimer(this, () -> {
            for (Player player : Bukkit.getOnlinePlayers()) {
                deliveryService.checkAndDeliver(player);
            }
        }, intervalTicks, intervalTicks);

        getLogger().info("NovaPixelStore habilitado. Consultando " + getConfig().getString("api-base-url"));
    }

    @Override
    public void onDisable() {
        if (realtimeClient != null) {
            realtimeClient.stop();
        }
    }

    private void reloadPluginConfig() {
        reloadConfig();
        String apiBaseUrl = getConfig().getString("api-base-url", "");
        String pluginSecret = getConfig().getString("plugin-secret", "");

        if (apiBaseUrl.isBlank() || pluginSecret.isBlank() || pluginSecret.equals("cambia-esto-por-un-secreto-largo-y-aleatorio")) {
            getLogger().warning("Configura api-base-url y plugin-secret en config.yml (deben coincidir con el .env del backend).");
        }

        if (realtimeClient != null) {
            realtimeClient.stop();
        }

        StoreApiClient apiClient = new StoreApiClient(apiBaseUrl, pluginSecret, getLogger());
        this.deliveryService = new DeliveryService(this, apiClient);
        this.realtimeClient = new RealtimeClient(this, deliveryService, apiBaseUrl, pluginSecret, getLogger());
        this.realtimeClient.start();
    }

    // PurchaseListener lee este getter en cada join en vez de guardarse su
    // propia copia, para no quedar con un DeliveryService viejo después de
    // /novapixelstore reload.
    DeliveryService getDeliveryService() {
        return deliveryService;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (args.length == 0) {
            sender.sendMessage("§cUso: /novapixelstore reload | check <jugador>");
            return true;
        }

        switch (args[0].toLowerCase()) {
            case "reload":
                reloadPluginConfig();
                sender.sendMessage("§a[NovaPixel] Configuración recargada.");
                return true;
            case "check":
                if (args.length < 2) {
                    sender.sendMessage("§cUso: /novapixelstore check <jugador>");
                    return true;
                }
                Player target = Bukkit.getPlayerExact(args[1]);
                if (target == null) {
                    sender.sendMessage("§cEse jugador no está conectado.");
                    return true;
                }
                deliveryService.checkAndDeliver(target);
                sender.sendMessage("§a[NovaPixel] Revisando compras pendientes de " + target.getName() + "...");
                return true;
            default:
                sender.sendMessage("§cUso: /novapixelstore reload | check <jugador>");
                return true;
        }
    }
}

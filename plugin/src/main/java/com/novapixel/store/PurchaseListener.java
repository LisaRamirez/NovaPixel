package com.novapixel.store;

import org.bukkit.Bukkit;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerJoinEvent;

final class PurchaseListener implements Listener {

    private final NovaPixelStore plugin;
    private final long joinDelayTicks;

    PurchaseListener(NovaPixelStore plugin, long joinDelaySeconds) {
        this.plugin = plugin;
        this.joinDelayTicks = joinDelaySeconds * 20L;
    }

    @EventHandler
    public void onPlayerJoin(PlayerJoinEvent event) {
        Bukkit.getScheduler().runTaskLater(plugin, () -> {
            if (event.getPlayer().isOnline()) {
                // Se lee en cada join en vez de guardarse en el constructor,
                // para no quedar con un DeliveryService viejo tras /novapixelstore reload.
                plugin.getDeliveryService().checkAndDeliver(event.getPlayer());
            }
        }, joinDelayTicks);
    }
}

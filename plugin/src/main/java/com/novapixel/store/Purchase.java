package com.novapixel.store;

import java.util.List;

final class Purchase {
    final int id;
    final String productId;
    final String productName;
    final List<String> commands;
    final boolean manual;

    Purchase(int id, String productId, String productName, List<String> commands, boolean manual) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.commands = commands;
        this.manual = manual;
    }
}

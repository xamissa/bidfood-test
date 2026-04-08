odoo.define('pos_combo_pro.ComboButton', function (require) {
    'use strict';

    const models = require('point_of_sale.models');
    const PosComponent = require('point_of_sale.PosComponent');
    const ProductScreen = require('point_of_sale.ProductScreen');
    const Registries = require('point_of_sale.Registries');

    console.log("✅ Combo JS Loaded");

    // Load fields
    models.load_fields('product.product', [
        'is_combo',
        'combo_price',
        'combo_item_ids'
    ]);

    // Extend Order (your logic kept)
    const ComboOrder = (Order) => class ComboOrder extends Order {
        apply_combo(combo_product) {
            const lines = this.get_orderlines();
        
            const combo_items = combo_product.combo_item_ids || [];
            const combo_price = combo_product.combo_price;
        
            const matched_lines = lines.filter(line =>
                combo_items.includes(line.product.id)
            );
        
            if (matched_lines.length !== combo_items.length) return;
        
            // ✅ Step 1: total WITH tax
            let total_with_tax = 0;
            matched_lines.forEach(line => {
                total_with_tax += line.get_all_prices().priceWithTax;
            });
        
            // ✅ Step 2: total WITHOUT tax
            let total_without_tax = 0;
            matched_lines.forEach(line => {
                total_without_tax += line.get_all_prices().priceWithoutTax;
            });
        
            // ✅ Step 3: derive effective tax ratio
            const tax_ratio = total_with_tax / total_without_tax;
        
            // ✅ Step 4: convert combo price → EXCLUDED
            const combo_price_excl = combo_price / tax_ratio;
        
            // ✅ Step 5: discount on EXCLUDED
            const discount_total = total_without_tax - combo_price_excl;
        
            if (discount_total <= 0) return;
        
            matched_lines.forEach(line => {
                const prices = line.get_all_prices();
        
                const line_base = prices.priceWithoutTax;
        
                const ratio = line_base / total_without_tax;
        
                const line_discount = discount_total * ratio;
        
                const discount_percent = (line_discount / line_base) * 100;
        
                line.set_discount(discount_percent);
            });
        
            console.log("✅ FINAL TOTAL SHOULD MATCH COMBO PRICE");
        }
    };

    models.Order = ComboOrder(models.Order);

    // ✅ FIXED BUTTON
    class ComboButton extends PosComponent {
        async onClick() {
            console.log("✅ Button Clicked");
        
            const order = this.env.pos.get_order();
            const lines = order.get_orderlines();
        
            // Get all products from POS
            const products = this.env.pos.db.get_product_by_category(0);
            console.log("ssssssssssssssssssssssssss",products)
            // ✅ Get ONLY combo products (from template)
            const combo_products = products.filter(p =>
                p.is_combo
            );
        
            console.log("Combo Products:", combo_products);
        
            if (!combo_products.length) {
                alert("No combo configured");
                return;
            }
        
            // ✅ Get current order product IDs
            const order_product_ids = lines.map(line => line.product.id);
        
            console.log("Order Products:", order_product_ids);
        
            // ✅ Find matching combo
            let matched_combo = null;
        
            for (let combo of combo_products) {
                const combo_items = combo.product_tmpl_id.combo_item_ids || [];
        
                const is_match = combo_items.every(id =>
                    order_product_ids.includes(id)
                );
        
                if (is_match) {
                    matched_combo = combo;
                    break;
                }
            }
        
            if (!matched_combo) {
                alert("No matching combo found");
                return;
            }
        
            console.log("✅ Matched Combo:", matched_combo);
        
            // Apply combo
            order.apply_combo(matched_combo);
        }
    }

    ComboButton.template = 'ComboButton';

    // ✅ THIS WAS MISSING (MOST IMPORTANT)
    ProductScreen.addControlButton({
        component: ComboButton,
        condition: () => true,
        position: ['before', 'SetFiscalPositionButton'],
    });

    Registries.Component.add(ComboButton);

    return ComboButton;
});
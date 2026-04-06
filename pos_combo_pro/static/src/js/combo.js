odoo.define('pos_combo_pro.combo', function (require) {
    'use strict';

    const models = require('point_of_sale.models');
    const ProductScreen = require('point_of_sale.ProductScreen');
    const Registries = require('point_of_sale.Registries');

    // Load fields into POS
    models.load_fields('product.product', [
        'is_combo',
        'combo_price',
        'combo_item_ids'
    ]);

    // Extend Order
    const ComboOrder = (Order) => class ComboOrder extends Order {

        apply_combo(combo_product) {
            const lines = this.get_orderlines();

            const combo_items = combo_product.combo_item_ids;

            // Filter matching lines
            const matched_lines = lines.filter(line =>
                combo_items.includes(line.product.id)
            );

            if (matched_lines.length !== combo_items.length) {
                return;
            }

            let total = 0;
            matched_lines.forEach(line => {
                total += line.get_unit_price() * line.get_quantity();
            });

            const target_total = combo_product.combo_price;

            const discount_total = total - target_total;

            if (discount_total <= 0) return;

            matched_lines.forEach(line => {
                const line_price = line.get_unit_price() * line.get_quantity();

                const ratio = line_price / total;

                const line_discount = discount_total * ratio;

                const discount_percent = (line_discount / line_price) * 100;

                line.set_discount(discount_percent);
            });
        }
    };

    models.Order = ComboOrder(models.Order);

    // POS Button
    class ComboButton extends ProductScreen {
        async _onClickCombo() {
            const order = this.env.pos.get_order();
            const products = this.env.pos.db.get_product_by_category(0);

            const combo_products = products.filter(p => p.is_combo);

            if (!combo_products.length) {
                return;
            }

            // Apply first combo found (can improve later)
            order.apply_combo(combo_products[0]);
        }
    }

    ComboButton.template = 'ComboButton';

    Registries.Component.add(ComboButton);

    return ComboButton;
});
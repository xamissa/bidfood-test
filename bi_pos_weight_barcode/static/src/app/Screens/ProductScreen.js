/** @odoo-module */

import { patch } from "@web/core/utils/patch";
import { ProductScreen } from "@point_of_sale/app/screens/product_screen/product_screen";

patch(ProductScreen.prototype, {
    async _barcodeProductAction(code) {
        const handled = await this.scanWeightBarcode(code.base_code);
        if (!handled) {
            return await super._barcodeProductAction(code);
        }
    },

    async scanWeightBarcode(parsedCode) {
        const records = await this.pos.data.orm.call(
            "product.weight.barcode",
            "search_read",
            [[["barcode", "=", parsedCode]], ["barcode", "weight", "product_id"]]
        );
        if (!records.length) {
            return false;
        }
        const rec = records[0];
        const product = this.pos.models["product.product"].get(rec.product_id[0]);
        if (!product) {
            return false;
        }
        await this.pos.addLineToCurrentOrder(
            { product_tmpl_id: product.product_tmpl_id, product_id: product, qty: rec.weight },
            {},
            false
        );
        return true;
    },
});

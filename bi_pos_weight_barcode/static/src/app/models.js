/** @odoo-module */

import { PosOrder } from "@point_of_sale/app/models/pos_order";
import { patch } from "@web/core/utils/patch";

patch(PosOrder.prototype, {
    setup(vals) {
        super.setup(vals);
        this.wb_product = this.wb_product || false;
        this.wb_barcode = this.wb_barcode || false;
        this.wb_weight = this.wb_weight || false;
        this.wb_price = this.wb_price || false;
    },
    setWbProduct(value) { this.wb_product = value; },
    getWbProduct() { return this.wb_product; },
    setWbBarcode(value) { this.wb_barcode = value; },
    getWbBarcode() { return this.wb_barcode; },
    setWbWeight(value) { this.wb_weight = value; },
    getWbWeight() { return this.wb_weight; },
    setWbPrice(value) { this.wb_price = value; },
    getWbPrice() { return this.wb_price; },
});

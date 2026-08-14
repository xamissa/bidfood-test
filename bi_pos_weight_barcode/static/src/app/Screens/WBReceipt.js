/** @odoo-module */

import { Component, onMounted, onPatched } from "@odoo/owl";

const { DateTime } = luxon;

export class WBReceipt extends Component {
    static template = "bi_pos_weight_barcode.WBReceipt";
    static props = {
        barcode: String,
        productName: String,
        weight: String,
        price: String,
    };

    setup() {
        const renderBarcode = () => {
            const el = document.getElementById(`wb-barcode-${this.props.barcode}`);
            if (el && window.JsBarcode) {
                window.JsBarcode(el, this.props.barcode, {
                    lineColor: "#000000",
                    width: 1,
                    height: 50,
                    displayValue: true,
                    fontSize: 15,
                });
            }
        };
        onMounted(renderBarcode);
        onPatched(renderBarcode);
    }

    get todaydate() {
        return DateTime.now().toFormat("yyyy-MM-dd HH:mm:ss");
    }
}

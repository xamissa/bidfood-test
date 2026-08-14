/** @odoo-module */

import { OrderReceipt } from "@point_of_sale/app/screens/receipt_screen/receipt/order_receipt";
import { PosOrderline } from "@point_of_sale/app/models/pos_order_line";
import { patch } from "@web/core/utils/patch";
import { Component, xml } from "@odoo/owl";

patch(PosOrderline.prototype, {
    get_product() { return this.getProduct(); },
    get_discount() { return this.getDiscount(); },
    get_quantity_str_with_unit() {
        const qty = this.getQuantityStr().qtyStr;
        const unit = this.getUnit()?.name || "";
        return unit ? `${qty} ${unit}` : qty;
    },
    get_display_price() { return this.price_unit * this.qty * (1 - this.getDiscount() / 100); },
});

patch(OrderReceipt.prototype, {
    get isStandardReceipt() {
        return !this.order.config.is_custom_receipt || !this.order.config.design_receipt;
    },
    get templateProps() {
        const cashier = this.env.services.pos.getCashier()?.name || "";
        this.order.cashier = cashier;
        const date = this.order.date_order?.toFormat
            ? this.order.date_order.toFormat("yyyy-MM-dd HH:mm:ss")
            : (this.order.date_order || "");
        const taxAmount = (this.order.priceIncl || 0) - (this.order.priceExcl || 0);
        return {
            order: this.order,
            receipt: {
                name: this.order.pos_reference || this.order.name || "",
                date,
                headerData: { header: this.order.config.receipt_header || "" },
                amount_total: this.order.priceExcl,
                total_with_tax: this.order.priceIncl,
            },
            orderlines: this.order.lines,
            paymentlines: this.order.payment_ids,
            data: {
                amount_total: this.order.priceIncl,
                total_without_tax: this.order.priceExcl,
                tax_details: taxAmount ? [{ amount: taxAmount }] : [],
            },
        };
    },
    get templateComponent() {
        const template = this.order.config.design_receipt;
        return class CustomReceipt extends Component {
            static template = xml`${template}`;
        };
    },
});

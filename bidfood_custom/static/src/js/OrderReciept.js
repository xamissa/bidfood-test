/** @odoo-module */
import { OrderReceipt } from "@point_of_sale/app/screens/receipt_screen/receipt/order_receipt";
import { patch } from "@web/core/utils/patch";
import { useState, Component, xml } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

patch(OrderReceipt.prototype, {
    setup(){
        super.setup();
        this.state = useState({
            template: true,
        })
        this.pos = useState(useService("pos"));
        this.props = {
            data: this.props.data,
            order: this.pos.get_order(),
            receipt: this.pos.get_order().export_for_printing(),
            orderlines: this.pos.get_order().get_orderlines(),
            paymentlines: this.pos.get_order().export_for_printing().paymentlines
        };
    },
});
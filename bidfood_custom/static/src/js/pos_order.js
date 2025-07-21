import { PosOrder } from "@point_of_sale/app/models/pos_order";
import { patch } from "@web/core/utils/patch";
import { useState, Component, xml } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

patch(PosOrder.prototype, {

	setup(_defaultObj, options) {
        super.setup(...arguments);        
    },
    export_for_printing(baseUrl, headerData) {
        return {
            ...super.export_for_printing(...arguments),
            receipt: this,
        };
    },
});
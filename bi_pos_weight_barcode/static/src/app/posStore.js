/** @odoo-module */

import { patch } from "@web/core/utils/patch";
import { PosStore } from "@point_of_sale/app/services/pos_store";
import { makeAwaitable } from "@point_of_sale/app/utils/make_awaitable_dialog";
import { BiScaleScreen } from "@bi_pos_weight_barcode/app/Screens/BiScaleScreen";

patch(PosStore.prototype, {
    async processServerData() {
        await super.processServerData(...arguments);
        const rules = this.models["barcode.rule"]?.getAll?.() || [];
        this.barcode_rule_by_id = {};
        this.barcode_rule_by_type = {};
        for (const rule of rules) {
            this.barcode_rule_by_id[rule.id] = rule;
            this.barcode_rule_by_type[rule.type] = rule;
        }
        // This feature requires the scale service. The custom setting is the
        // explicit opt-in for the Bidfood weight/barcode flow.
        if (this.config.is_weight_scale_screen) {
            this.config.iface_electronic_scale = true;
        }
    },

    weighProduct() {
        if (this.config.is_weight_scale_screen) {
            return makeAwaitable(this.env.services.dialog, BiScaleScreen);
        }
        return super.weighProduct(...arguments);
    },
});

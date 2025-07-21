/** @odoo-module */

import { PosOrder } from "@point_of_sale/app/models/pos_order";
import { PosOrderline } from "@point_of_sale/app/models/pos_order_line";
import { patch } from "@web/core/utils/patch";
import { _t } from "@web/core/l10n/translation";
import { Orderline } from "@point_of_sale/app/generic_components/orderline/orderline";

patch(PosOrder.prototype,{
    setup() {
        super.setup(...arguments);
        this.wb_product = this.wb_product || false;
        this.wb_barcode = this.wb_barcode || false;
        this.wb_weight = this.wb_weight || false;
        this.wb_price = this.wb_price || false;
    },
    set_wb_product(wb_product){
        this.wb_product = wb_product;
    },
    get_wb_product(){
        return this.wb_product;
    },
    export_for_printing(){
        const json = super.export_for_printing(...arguments);
        json.wb_barcode = this.get_wb_barcode();
        json.wb_product = this.get_wb_product();
        json.wb_weight = this.get_wb_weight();
        json.wb_price = this.get_wb_price();
        return json;
    },
    
    set_wb_barcode(wb_barcode){
        this.wb_barcode = wb_barcode;
    },
    get_wb_barcode(){
        return this.wb_barcode;
    },
    set_wb_weight(wb_weight){
        this.wb_weight = wb_weight;
    },
    get_wb_weight(){
        return this.wb_weight;
    },
    set_wb_price(wb_price){
        this.wb_price = wb_price;
    },
    get_wb_price(){
            return this.wb_price;
    },


});
patch(PosOrderline.prototype, {
    setup() {
        super.setup(...arguments);
        this.weight_barcode = this.weight_barcode || "";
    },
    set_weight_barcode(weight_barcode){
        this.weight_barcode = weight_barcode;
    },

    get_weight_barcode(){
        return this.weight_barcode;
    },

    getDisplayData() {
        return {
        	...super.getDisplayData(),
            weightBarcode: this.get_weight_barcode(),
        };
    }
});

patch(Orderline, {
    props: {
        ...Orderline.props,
        line: {
            ...Orderline.props.line,
            shape: {
                ...Orderline.props.line.shape,
                weightBarcode: { type: String, optional: true },
            },
        },
    },
});

/** @odoo-module */

import { Component, onMounted } from "@odoo/owl";
import { _t } from "@web/core/l10n/translation";
import { usePos } from "@point_of_sale/app/store/pos_hook";
const { DateTime } = luxon;
import { registry } from "@web/core/registry";

export class WBReceipt extends Component {
    static template = "bi_pos_weight_barcode.WBReceipt";

    setup() {
        super.setup(...arguments);
        this.pos = usePos();
        let order = this.pos.get_order();
        if (this.props.barcode){
            let barcode = this.props.barcode;
            order.set_wb_barcode(barcode)
            var data = barcode
            onMounted(() => {
                JsBarcode("#barcode", data, {
                    lineColor: "#000000",
                    width: 1,
                    height: 50,
                    displayValue: true,
                    fontSize: 15,
                });
            });
        }else{
            let barcode = this.props.data.wb_barcode;
            order.set_wb_barcode(barcode)
            var data = barcode
            onMounted(() => {

                JsBarcode("#barcode", data, {
                    lineColor: "#000000",
                    width: 1,
                    height: 50,
                    displayValue: true,
                    fontSize: 15,
                });
            });
        }
    }

    get todaydate(){
        return  DateTime.now().toFormat("yyyy-MM-dd hh:mm:ss");
    }
    get product(){
        if (this.props.product){
            let product = this.props.product.display_name;
            this.pos.get_order().set_wb_product(product)
            return product;
        }
        return  this.pos.get_order().get_wb_product()
    }

    get weight(){
        if (this.props.weight){
            let weight = this.props.weight;
            this.pos.get_order().set_wb_weight(weight)
            return weight;
        }
        return  this.pos.get_order().get_wb_weight()
    }

    get price(){
        if(this.props.price){
            let price = this.props.price;
            this.pos.get_order().set_wb_price(price)
            return price;
        }
        return this.pos.get_order().get_wb_price()
    }

    get receiptBarcode(){
        var order = this.pos.get_order();
        return true;
    }
}

registry.category("pos_screens").add("WBReceipt", WBReceipt);

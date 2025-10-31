/** @odoo-module */

import { roundPrecision as round_pr } from "@web/core/utils/numbers";
import { registry } from "@web/core/registry";
import { usePos } from "@point_of_sale/app/store/pos_hook";
import { Component, onMounted, onWillUnmount, useExternalListener, useState } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

export class BiScaleScreen extends Component {
    static template = "bi_pos_weight_barcode.BiScaleScreen";

    setup() {
        this.pos = usePos();
        this.hardwareProxy = useService("hardware_proxy");
        useExternalListener(document, "keyup", this._onHotkeys);
        this.state = useState({ weight: 0 });
        onMounted(this.onMounted);
        onWillUnmount(this.onWillUnmount);
    }
    onMounted() {
        this._readScale();
    }
    onWillUnmount() {
        this.shouldRead = false;
    }
    confirm() {
        this.props.getPayload({
            payload: { weight: this.state.weight },
        });
        this.props.close();
    }
    _onHotkeys(event) {
        if (event.key === "Escape") {
            this.back();
        } else if (event.key === "Enter") {
            this.confirm();
        }
    }

    back(){
        this.pos.showScreen('ProductScreen')
    }
    _readScale() {
        this.shouldRead = true;
        this._setWeight();
    }
    async _setWeight() {
        if (!this.shouldRead) {
            return;
        }
        this.state.weight = await this.hardwareProxy.readScale();
        setTimeout(() => this._setWeight(), 500);
    }
    get _activePricelist() {
        const current_order = this.pos.get_order();
        let current_pricelist = this.pos.default_pricelist;
        if (current_order) {
            current_pricelist = current_order.pricelist;
        }
        return current_pricelist;
    }
    get productWeightString() {
        const defaultstr = (this.state.weight || 0).toFixed(3) + " Kg";
        if (!this.props.product) {
            return defaultstr;
        }
        const uom = this.props.product.uom_id;
        if (!uom) {
            return defaultstr;
        }
        const weight = round_pr(this.state.weight || 0, uom.rounding);
        let weightstr = weight.toFixed(Math.ceil(Math.log(1.0 / uom.rounding) / Math.log(10)));
        weightstr += " " + uom.name;
        return weightstr;
    }

    get computedPriceString() {
        return this.env.utils.formatCurrency(this.state.weight * this.props.product.lst_price);
    }

    get productPrice() {
        const product = this.props.product;
        return (product ? product.get_price(this._activePricelist, this.state.weight) : 0) || 0;
    }
    get productName() {
        return this.props.product?.display_name || "Unnamed Product";
    }

    get productUom(){
        let uom = this.props.product?.uom_id;
        if(uom){
            return uom.name;
        }
        return '';
    }
    
    async createBarcode(){
        let self = this;
        let order = self.pos.get_order();
        let barcode_rule = self.pos.barcode_rule_by_type["weight"];
        let barcode = '';
        if(barcode_rule && barcode_rule.pattern != '.*'){
            let prefix = parseInt(barcode_rule.pattern.replace(/[^0-9.]/g, "")).toString();
            let temp = '';
            if(barcode_rule.encoding == 'any' || barcode_rule.encoding == 'ean8'){
                if(prefix.length == 3){
                    temp = Math.floor(10000 + Math.random() * 99999);
                }
                else{
                    temp = Math.floor(100000 + Math.random() * 999999);
                }
            }else{
                if(prefix.length == 3){
                    temp = Math.floor(1000000000 + Math.random() * 9999999999);
                }
                else{
                    temp = Math.floor(1000000000 + Math.random() * 99999999999);
                }
            }
            barcode = prefix.toString() + temp.toString();
            order.set_wb_barcode(barcode)
        }
        self.pos.showScreen('WBReceiptScreen',{
            barcode : barcode,
            product : self.props.product,
            weight : self.productWeightString,
            price : self.computedPriceString,
            wt : self.state.weight,
        });

    }
}

registry.category("pos_screens").add("BiScaleScreen", BiScaleScreen);

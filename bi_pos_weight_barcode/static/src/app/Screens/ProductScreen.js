/** @odoo-module */

import { patch } from "@web/core/utils/patch";
import { ProductScreen } from "@point_of_sale/app/screens/product_screen/product_screen";
import { usePos } from "@point_of_sale/app/store/pos_hook";
import { _t } from "@web/core/l10n/translation";

patch(ProductScreen.prototype,{
    setup() {
        super.setup();
        this.pos=usePos();
    },
    async _barcodeProductAction(code) {
        let check = await this.scan_prod_barcode(code.base_code)
        if(check == false){
            super._barcodeProductAction(code);
        }
    },
    async scan_prod_barcode (parsed_code){
        let self = this;
        let prod_added = false;
        await self.pos.data.orm.call(
            'product.weight.barcode',
            'search_read',
            [[['barcode', '=', parsed_code]], ['barcode','weight','product_id']],
        ).then(function (barcode){
            if(barcode.length > 0){
                barcode = barcode[0];
                let product = self.pos.models['product.product'].getBy('id',barcode.product_id[0]);
                if(product){
                    self.pos.addLineToCurrentOrder({product_id: product,qty: barcode.weight},{},false);
                    prod_added =  true;
                }
            }
        });
        return prod_added;
    },
});

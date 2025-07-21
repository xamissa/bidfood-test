/** @odoo-module */

import { registry } from "@web/core/registry";
import { ReceiptScreen } from "@point_of_sale/app/screens/receipt_screen/receipt_screen";
import { usePos } from "@point_of_sale/app/store/pos_hook";
import { useService } from "@web/core/utils/hooks";
import { _t } from "@web/core/l10n/translation";
import { WBReceipt } from "@bi_pos_weight_barcode/app/Screens/WBReceipt";
import { useRef } from "@odoo/owl";

export class WBReceiptScreen extends ReceiptScreen {
    static components = { WBReceipt };
    static template = "bi_pos_weight_barcode.WBReceiptScreen";

    setup() {
        super.setup(...arguments);
        this.pos=usePos();
        this.orm = useService("orm");
        this.printer = useService("printer");
        this.create_barcode();
        this.currentOrder = this.pos.get_order();
        this.buttonPrintReceipt = useRef("order-print-receipt-button");
    }

    static props = ["product", "barcode","wt","weight","price"]

    async printReceipt() {
        this.buttonPrintReceipt.el.className = "fa fa-fw fa-spin fa-circle-o-notch";
        const isPrinted = await this.printer.print(
            WBReceipt,
            {
                data: this.currentOrder,
                formatCurrency: this.env.utils.formatCurrency,
            },
            { webPrintFallback: true }
        );

        if (isPrinted) {
            this.currentOrder._printed = true;
        }

        if (this.buttonPrintReceipt.el) {
            this.buttonPrintReceipt.el.className = "fa fa-print";
        }
    }

    back() {
        this.pos.showScreen('ProductScreen');
    } 
    async create_barcode(){
        let self = this;
        let curr_session = self.pos.config.current_session_id.id;
        await self.pos.data.orm.call(
            'product.product',
            'create_weight_barcode',
            [self.props.product.id, self.props.barcode,self.props.wt,curr_session],
        )
    }
}
registry.category("pos_screens").add("WBReceiptScreen", WBReceiptScreen);

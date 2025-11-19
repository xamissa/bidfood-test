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
        this.pos = usePos();
        this.orm = useService("orm");
        this.printer = useService("printer");
        this.buttonPrintReceipt = useRef("order-print-receipt-button");
        
        this.product = null;
        if (this.props.productId) {
            this.product = this.pos.models['product.product'].get(this.props.productId);
        }
        
        this.create_barcode();
    }
    
    static props = {
        productId: { type: Number, optional: true },
        productName: { type: String, optional: true },
        barcode: { type: String, optional: true },
        wt: { type: Number, optional: true },
        weight: { type: String, optional: true },
        price: { type: String, optional: true },
    }
    
    get currentOrder() {
        return this.pos.get_order();
    }
    
    async printReceipt() {
        this.buttonPrintReceipt.el.className = "fa fa-fw fa-spin fa-circle-o-notch";
        const isPrinted = await this.printer.print(
            WBReceipt,
            {
                data: this.currentOrder,
                formatCurrency: this.env.utils.formatCurrency,
                barcode: this.props.barcode,
                productName: this.props.productName,
                weight: this.props.weight,
                price: this.props.price,
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
        if (self.props.productId) {
            await self.pos.data.orm.call(
                'product.product',
                'create_weight_barcode',
                [self.props.productId, self.props.barcode, self.props.wt, curr_session],
            );
        }
    }
}

registry.category("pos_screens").add("WBReceiptScreen", WBReceiptScreen);
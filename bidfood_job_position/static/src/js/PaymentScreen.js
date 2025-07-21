import { PaymentScreen } from "@point_of_sale/app/screens/payment_screen/payment_screen";
import { patch } from "@web/core/utils/patch";
import { AlertDialog } from "@web/core/confirmation_dialog/confirmation_dialog";
import { _t } from "@web/core/l10n/translation";
import { usePos } from "@point_of_sale/app/store/pos_hook";
import { ask } from "@point_of_sale/app/store/make_awaitable_dialog";


patch(PaymentScreen.prototype, {

    setup() {
        super.setup();
        this.pos = usePos();
    },

    async validateOrder(isForceValidate) 
    {
        if(!this.currentOrder.get_partner())
        {

            const confirmed = await ask(this.dialog, {
                title: _t("Customer Required"),
                body: _t("You need to select the customer before you can invoice or ship an order."),
            });
            if (confirmed) {
                this.pos.selectPartner();
            }
            return false;
        }
        await super.validateOrder(...arguments);
    }
});
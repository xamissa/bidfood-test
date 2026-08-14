/** @odoo-module */

import { PaymentScreen } from "@point_of_sale/app/screens/payment_screen/payment_screen";
import { patch } from "@web/core/utils/patch";
import { _t } from "@web/core/l10n/translation";
import { ask } from "@point_of_sale/app/utils/make_awaitable_dialog";

patch(PaymentScreen.prototype, {
    async validateOrder(isForceValidate = false) {
        if (!this.currentOrder.getPartner()) {
            const confirmed = await ask(this.dialog, {
                title: _t("Customer Required"),
                body: _t("You need to select the customer before you can invoice or ship an order."),
            });
            if (confirmed) {
                await this.pos.selectPartner();
            }
            return;
        }
        return await super.validateOrder(isForceValidate);
    },
});

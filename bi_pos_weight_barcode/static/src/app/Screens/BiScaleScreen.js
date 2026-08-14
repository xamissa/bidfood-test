/** @odoo-module */

import { useState } from "@odoo/owl";
import { Dialog } from "@web/core/dialog/dialog";
import { useService } from "@web/core/utils/hooks";
import { _t } from "@web/core/l10n/translation";
import { ScaleScreen } from "@point_of_sale/app/screens/scale_screen/scale_screen";
import { usePos } from "@point_of_sale/app/hooks/pos_hook";
import { WBReceipt } from "@bi_pos_weight_barcode/app/Screens/WBReceipt";

export class BiScaleScreen extends ScaleScreen {
    static template = "bi_pos_weight_barcode.BiScaleScreen";
    static components = { Dialog, WBReceipt };
    static props = {
        getPayload: Function,
        close: Function,
    };

    setup() {
        super.setup();
        this.pos = usePos();
        this.printer = useService("printer");
        this.notification = useService("notification");
        this.state = useState({
            barcode: "",
            productName: "",
            weight: "",
            price: "",
            rawWeight: 0,
            creating: false,
        });
    }

    get product() {
        return this.scale.product;
    }

    async createBarcode() {
        if (!this.scale.isWeightValid || this.state.creating) {
            return;
        }
        this.state.creating = true;
        try {
            const weight = this.scale.confirmWeight();
            const product = this.product;
            const rule = this.pos.barcode_rule_by_type?.weight;
            if (!rule || rule.pattern === ".*") {
                this.notification.add(_t("Configure a weighted-product barcode rule first."), {
                    type: "warning",
                });
                return;
            }

            const prefixDigits = (rule.pattern || "").replace(/[^0-9]/g, "");
            const prefix = prefixDigits || "20";
            const targetLength = rule.encoding === "ean8" ? 7 : 12;
            const randomLength = Math.max(1, targetLength - prefix.length);
            let randomPart = "";
            for (let i = 0; i < randomLength; i++) {
                randomPart += Math.floor(Math.random() * 10).toString();
            }
            const barcode = (prefix + randomPart).slice(0, targetLength);

            await this.pos.data.orm.call("product.product", "create_weight_barcode", [
                product.id,
                barcode,
                weight,
                this.pos.session.id,
            ]);

            this.state.barcode = barcode;
            this.state.rawWeight = weight;
            this.state.productName = product.display_name || product.name || "";
            this.state.weight = this.scale.netWeightString;
            this.state.price = this.scale.totalPriceString;
        } finally {
            this.state.creating = false;
        }
    }

    async printBarcode() {
        if (!this.state.barcode) {
            return;
        }
        await this.printer.print(
            WBReceipt,
            {
                barcode: this.state.barcode,
                productName: this.state.productName,
                weight: this.state.weight,
                price: this.state.price,
            },
            { webPrintFallback: true }
        );
    }

    closeAfterBarcode() {
        this.props.getPayload(undefined);
        this.props.close();
    }
}

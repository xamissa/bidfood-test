/** @odoo-module */

import { roundPrecision as round_pr } from "@web/core/utils/numbers";
import { registry } from "@web/core/registry";
import { usePos } from "@point_of_sale/app/store/pos_hook";
import { Component, onMounted, onWillUnmount, useExternalListener, useState } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { HardwareProxy } from "@point_of_sale/app/hardware_proxy/hardware_proxy_service";
import { patch } from "@web/core/utils/patch";
import { DebugWidget } from "@point_of_sale/app/debug/debug_widget";

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

    get _scaleDevice() {
        return this.hardwareProxy.deviceControllers?.scale;
    }

    get isManualMeasurement() {
        return this._scaleDevice?.manual_measurement;
    }

    reset() {
        if (this.isMeasuring) {
            this._scaleDevice?.removeListener();
            this._scaleDevice?.action({ action: "stop_reading" });
        }
        super.reset(...arguments);
    }

    async _getWeightFromScale() {
        const weightPromise = new Promise((resolve, reject) => {
            this._scaleDevice.addListener((data) => {
                try {
                    resolve(this._handleScaleMessage(data));
                } catch (error) {
                    reject(error);
                }
                this._scaleDevice.removeListener();
            });
        });
        await this._scaleDevice.action({ action: "read_once" });
        return weightPromise;
    }

    _readWeightContinuously() {
        try {
            this._checkScaleIsConnected();
        } catch (error) {
            this.onError?.(error.message);
            this.isMeasuring = false;
            return;
        }

        this._scaleDevice.addListener((data) => {
            try {
                this.weight = this._handleScaleMessage(data);
                this._setTareIfRequested();
            } catch (error) {
                this.onError?.(error.message);
            }
        });

        // The IoT box only sends the weight when it changes, so we
        // manually read to get the initial value.
        this._scaleDevice.action({ action: "read_once" });
        this._scaleDevice.action({ action: "start_reading" });
    }

    _handleScaleMessage(data) {
        // Expected format from IoT scale controller:
        // { status: { status: "ok"|"error", message_body: "" }, value: <number> }
        if (data?.status?.status === "error") {
            throw new Error(`Cannot weigh product - ${data.status.message_body}`);
        }
        return data?.value || 0;
    }

    get product() {
        if (this.props.productId) {
            return this.pos.models["product.product"].get(this.props.productId);
        }
        return this.props.product;
    }

    onMounted() {
        this._readScale();
    }

    onWillUnmount() {
        this.shouldRead = false;
    }

    confirm() {
        this.props.getPayload({
            weight: this.state.weight,
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

    back() {
        this.pos.showScreen("ProductScreen");
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
        // 500ms polling may spam serial and cause timeouts on some scales.
        // If you see SerialTimeoutException, change to 1000 or 1500.
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
        if (!this.product) {
            return defaultstr;
        }
        const uom = this.product.uom_id;
        if (!uom) {
            return defaultstr;
        }
        const weight = round_pr(this.state.weight || 0, uom.rounding);
        let weightstr = weight.toFixed(Math.ceil(Math.log(1.0 / uom.rounding) / Math.log(10)));
        weightstr += " " + uom.name;
        return weightstr;
    }

    get computedPriceString() {
        return this.env.utils.formatCurrency(this.state.weight * this.productPrice);
    }

    get productPrice() {
        const product = this.product;
        return (product ? product.get_price(this._activePricelist, this.state.weight) : 0) || 0;
    }

    get productName() {
        return this.product?.display_name || "Unnamed Product";
    }

    get productUom() {
        let uom = this.product?.uom_id;
        if (uom) {
            return uom.name;
        }
        return "";
    }

    async createBarcode() {
        let self = this;
        let order = self.pos.get_order();
        let barcode_rule = self.pos.barcode_rule_by_type["weight"];
        let barcode = "";
        if (barcode_rule && barcode_rule.pattern != ".*") {
            let prefix = parseInt(barcode_rule.pattern.replace(/[^0-9.]/g, "")).toString();
            let temp = "";
            if (barcode_rule.encoding == "any" || barcode_rule.encoding == "ean8") {
                if (prefix.length == 3) {
                    temp = Math.floor(10000 + Math.random() * 99999);
                } else {
                    temp = Math.floor(100000 + Math.random() * 999999);
                }
            } else {
                if (prefix.length == 3) {
                    temp = Math.floor(1000000000 + Math.random() * 9999999999);
                } else {
                    temp = Math.floor(1000000000 + Math.random() * 99999999999);
                }
            }
            barcode = prefix.toString() + temp.toString();
            order.set_wb_barcode(barcode);
        }

        self.pos.showScreen("WBReceiptScreen", {
            barcode: barcode,
            productId: self.props.productId,
            productName: self.productName,
            weight: self.productWeightString,
            price: self.computedPriceString,
            wt: self.state.weight,
        });
    }
}

registry.category("pos_screens").add("BiScaleScreen", BiScaleScreen);

/**
 * FIX: Odoo 18 on Odoo.sh does not expose /hw_proxy/scale_read.
 * The original module patched readScale() to call `this.message("scale_read")`,
 * which triggers POST /hw_proxy/scale_read (404).
 *
 * We replace it with a scale-controller-based read using deviceControllers.scale,
 * which works with IoT Box in Odoo 18.
 */
patch(HardwareProxy.prototype, {
    /**
     * Returns the weight on the scale.
     *
     * @returns {Promise<number>}
     */
    async readScale() {
        if (this.useDebugWeight) {
            return this.debugWeight;
        }

        const scale = this.deviceControllers?.scale;
        if (!scale) {
            return 0;
        }

        return await new Promise((resolve) => {
            try {
                scale.addListener((data) => {
                    try {
                        // Typical payload contains `value` as numeric weight
                        const weight = data?.value ? data.value : 0;
                        resolve(weight || 0);
                    } catch {
                        resolve(0);
                    }
                    // Always remove listener after one response
                    try {
                        scale.removeListener();
                    } catch {}
                });

                // Trigger a single read
                scale.action({ action: "read_once" });
            } catch {
                try {
                    scale.removeListener();
                } catch {}
                resolve(0);
            }
        });
    },

    /**
     * Sets a custom debug weight, ignoring actual scale values.
     * @param {number} weight
     */
    setDebugWeight(weight) {
        this.useDebugWeight = true;
        this.debugWeight = weight;
    },

    /**
     * Resets debug weight mode and returns to real scale readings.
     */
    resetDebugWeight() {
        this.useDebugWeight = false;
        this.debugWeight = 0;
    },
});

patch(DebugWidget.prototype, {
    setWeight() {
        var weightInKg = parseFloat(this.state.weightInput);
        if (!isNaN(weightInKg)) {
            this.hardwareProxy.setDebugWeight(weightInKg);
        }
    },
    resetWeight() {
        this.state.weightInput = "";
        this.hardwareProxy.resetDebugWeight();
    },
});

odoo.define('bi_pos_weight_barcode.BiScaleScreen', function(require) {
	'use strict';

	const { useState, useExternalListener } = owl.hooks;
	const PosComponent = require('point_of_sale.PosComponent');
	const { round_precision: round_pr } = require('web.utils');
	const Registries = require('point_of_sale.Registries');

	class BiScaleScreen extends PosComponent {
		/**
		 * @param {Object} props
		 * @param {Object} props.product The product to weight.
		 */
		constructor() {
			super(...arguments);
			useExternalListener(document, 'keyup', this._onHotkeys);
			this.state = useState({ weight: 0 });
		}
		mounted() {
            this.iot_box = _.find(this.env.pos.proxy.iot_boxes, iot_box => {
                return iot_box.ip == this.scale._iot_ip;
            });
            this._error = false;
            this.env.pos.proxy.on('change:status', this, async (eh, status) => {
                if (
                    !this.iot_box.connected ||
                    !status.newValue.drivers.scale ||
                    status.newValue.drivers.scale.status !== 'connected'
                ) {
                    if (!this._error) {
                        this._error = true;
                        await Gui.showPopup('ErrorPopup', {
                            title: this.env._t('Could not connect to IoT scale'),
                            body: this.env._t(
                                'The IoT scale is not responding. You should check your connection.'
                            ),
                        });
                    }
                } else {
                    this._error = false;
                }
            });
            if (!this.isManualMeasurement) {
                this.env.pos.proxy_queue.schedule(() =>
                    this.scale.action({ action: 'start_reading' })
                );
            }
            this._readScale();
        }
		willUnmount() {
            super.willUnmount();
            this.env.pos.proxy_queue.schedule(() =>
                this.scale.action({ action: 'stop_reading' })
            );
            if (this.scale) this.scale.remove_listener();
        }
		back() {
			this.props.resolve({ confirmed: false, payload: null });
			this.trigger('close-temp-screen');
		}
		confirm() {
			this.props.resolve({
				confirmed: true,
				payload: { weight: this.state.weight },
			});
			this.trigger('close-temp-screen');
		}
		_onHotkeys(event) {
			if (event.key === 'Escape') {
				this.back();
			} else if (event.key === 'Enter') {
				this.confirm();
			}
		}
		measureWeight() {
            this.env.pos.proxy_queue.schedule(() => this.scale.action({ action: 'read_once' }));
        }
		_readScale() {
            this.env.pos.proxy_queue.schedule(async () => {
                await this.scale.add_listener(this._onValueChange.bind(this));
                await this.scale.action({ action: 'read_once' });
            });
        }
        async _onValueChange(data) {
            if (data.status.status === 'error') {
                await Gui.showPopup('ErrorTracebackPopup', {
                    title: data.status.message_title,
                    body: data.status.message_body,
                });
            } else {
                this.state.weight = data.value;
            }
        }
		async _setWeight() {
			const reading = await this.env.pos.proxy.scale_read();
			this.state.weight = reading.weight;
		}
		get _activePricelist() {
			const current_order = this.env.pos.get_order();
			let current_pricelist = this.env.pos.default_pricelist;
			if (current_order) {
				current_pricelist = current_order.pricelist;
			}
			return current_pricelist;
		}
		get productWeightString() {
			const defaultstr = (this.state.weight || 0).toFixed(3) + ' Kg';
			if (!this.props.product || !this.env.pos) {
				return defaultstr;
			}
			const unit_id = this.props.product.uom_id;
			if (!unit_id) {
				return defaultstr;
			}
			const unit = this.env.pos.units_by_id[unit_id[0]];
			const weight = round_pr(this.state.weight || 0, unit.rounding);
			let weightstr = weight.toFixed(Math.ceil(Math.log(1.0 / unit.rounding) / Math.log(10)));
			weightstr += ' ' + unit.name;
			return weightstr;
		}
		get computedPriceString() {
			return this.env.pos.format_currency(this.productPrice * this.state.weight);
		}
		get productPrice() {
			const product = this.props.product;
			return (product ? product.get_display_price(this._activePricelist, this.state.weight) : 0) || 0;
		}
		get productName() {
			return (
				(this.props.product ? this.props.product.display_name : undefined) ||
				'Unnamed Product'
			);
		}
		get productUom() {
			return this.props.product
				? this.env.pos.units_by_id[this.props.product.uom_id[0]].name
				: '';
		}
		get scale() {
                return this.env.pos.iot_device_proxies.scale;
        }
        get isManualMeasurement() {
            return this.scale && this.scale.manual_measurement;
        }
		async createBarcode(event){
			let self = this;
			let order = this.env.pos.get_order();
			let barcode_rule = self.env.pos.barcode_rule_by_type["weight"];
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
			}
			self.showTempScreen('WBReceiptScreen',{
				barcode : barcode,
				product : self.props.product,
				weight : self.productWeightString,
				price : self.computedPriceString,
				wt : self.state.weight,
			});
			
		}

	}
	BiScaleScreen.template = 'BiScaleScreen';
	Registries.Component.add(BiScaleScreen);
	return BiScaleScreen;
});

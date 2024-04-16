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
			// start the scale reading
			this._readScale();
		}
		willUnmount() {
			// stop the scale reading
			this.env.pos.proxy_queue.clear();
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
		_readScale() {
			this.env.pos.proxy_queue.schedule(this._setWeight.bind(this), {
				duration: 500,
				repeat: true,
			});
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


				console.log("barcode===============",barcode)
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

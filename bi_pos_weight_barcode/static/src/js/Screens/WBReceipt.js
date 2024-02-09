odoo.define('bi_pos_weight_barcode.WBReceipt', function(require) {
	'use strict';

	const PosComponent = require('point_of_sale.PosComponent');
	const Registries = require('point_of_sale.Registries');
	var field_utils = require('web.field_utils');

	class WBReceipt extends PosComponent {
		constructor() {
			super(...arguments);
		}

		get todaydate(){
			return  field_utils.format.datetime(moment(new Date()), {}, {timezone: false});
		}

		get product(){
			let product = this.props.product.display_name;
			return product;
		}

		get weight(){
			let weight = this.props.weight;
			return weight;
		}

		get price(){
			let price = this.props.price;
			return price;
			
		}

		get receiptBarcode(){
			let barcode = this.props.barcode;
			$("#barcode_print1").barcode(
				barcode, // Value barcode (dependent on the type of barcode)
				"code128" // type (string)
			);
		return true
		}

	}
	
	WBReceipt.template = 'WBReceipt';
	Registries.Component.add(WBReceipt);
	return WBReceipt;
});

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
			var img = new Image();
            img.id = "test-barcode";
            $(img).JsBarcode(barcode.toString());
            barcode = $(img)[0] ? $(img)[0].src : false;
		return barcode
		}

	}
	
	WBReceipt.template = 'WBReceipt';
	Registries.Component.add(WBReceipt);
	return WBReceipt;
});

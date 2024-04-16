odoo.define('bi_pos_weight_barcode.WBReceiptScreen', function (require) {
	'use strict';

	const ReceiptScreen = require('point_of_sale.ReceiptScreen');
	const Registries = require('point_of_sale.Registries');

	const WBReceiptScreen = (ReceiptScreen) => {
		class WBReceiptScreen extends ReceiptScreen {
			constructor() {
				super(...arguments);
				this.create_barcode();
			}

			async create_barcode(){
				let self = this;
				// let order = this.env.pos.get_order();
				let curr_session = self.env.pos.config.current_session_id[0];
				await self.rpc({
					model: 'product.product',
					method: 'create_weight_barcode',
					args: [self.props.product.id, self.props.barcode,self.props.wt,curr_session],
				})
			}

			back() {
				this.props.resolve({ confirmed: true, payload: null });
				this.trigger('close-temp-screen');
			}
			
		}
		WBReceiptScreen.template = 'WBReceiptScreen';
		return WBReceiptScreen;
	};

	Registries.Component.addByExtending(WBReceiptScreen, ReceiptScreen);
	return WBReceiptScreen;
});

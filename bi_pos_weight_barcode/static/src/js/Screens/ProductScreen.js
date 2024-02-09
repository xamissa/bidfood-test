odoo.define('bi_pos_weight_barcode.productScreen', function(require) {
	"use strict";

	const Registries = require('point_of_sale.Registries');
	const ProductScreen = require('point_of_sale.ProductScreen');

	const BiProductScreen = (ProductScreen) =>
		class extends ProductScreen {
			constructor() {
				super(...arguments);
			}

			async _getAddProductOptions(product, base_code) {
				let price_extra = 0.0;
				let draftPackLotLines, weight, description, packLotLinesToEdit;

				if (this.env.pos.config.product_configurator && _.some(product.attribute_line_ids, (id) => id in this.env.pos.attributes_by_ptal_id)) {
					let attributes = _.map(product.attribute_line_ids, (id) => this.env.pos.attributes_by_ptal_id[id])
									  .filter((attr) => attr !== undefined);
					let { confirmed, payload } = await this.showPopup('ProductConfiguratorPopup', {
						product: product,
						attributes: attributes,
					});

					if (confirmed) {
						description = payload.selected_attributes.join(', ');
						price_extra += payload.price_extra;
					} else {
						return;
					}
				}

				// Gather lot information if required.
				if (['serial', 'lot'].includes(product.tracking) && (this.env.pos.picking_type.use_create_lots || this.env.pos.picking_type.use_existing_lots)) {
					const isAllowOnlyOneLot = product.isAllowOnlyOneLot();
					if (isAllowOnlyOneLot) {
						packLotLinesToEdit = [];
					} else {
						const orderline = this.currentOrder
							.get_orderlines()
							.filter(line => !line.get_discount())
							.find(line => line.product.id === product.id);
						if (orderline) {
							packLotLinesToEdit = orderline.getPackLotLinesToEdit();
						} else {
							packLotLinesToEdit = [];
						}
					}
					const { confirmed, payload } = await this.showPopup('EditListPopup', {
						title: this.env._t('Lot/Serial Number(s) Required'),
						isSingleItem: isAllowOnlyOneLot,
						array: packLotLinesToEdit,
					});
					if (confirmed) {
						// Segregate the old and new packlot lines
						const modifiedPackLotLines = Object.fromEntries(
							payload.newArray.filter(item => item.id).map(item => [item.id, item.text])
						);
						const newPackLotLines = payload.newArray
							.filter(item => !item.id)
							.map(item => ({ lot_name: item.text }));

						draftPackLotLines = { modifiedPackLotLines, newPackLotLines };
					} else {
						// We don't proceed on adding product.
						return;
					}
				}

				// Take the weight if necessary.
				if (product.to_weight) {
					if(this.env.pos.config.is_weight_scale_screen){
						const { confirmed, payload } = await this.showTempScreen('BiScaleScreen', {
							product,
						});
						if (confirmed) {
							weight = payload.weight;
						} else {
							// do not add the product;
							return;
						}
					}
					if(this.env.pos.config.iface_electronic_scale && !this.env.pos.config.is_weight_scale_screen){
						// Show the ScaleScreen to weigh the product.
						if (this.isScaleAvailable) {
							const { confirmed, payload } = await this.showTempScreen('ScaleScreen', {
								product,
							});
							if (confirmed) {
								weight = payload.weight;
							} else {
								// do not add the product;
								return;
							}
						} else {
							await this._onScaleNotAvailable();
						}
					}
					
				}

				if (base_code && this.env.pos.db.product_packaging_by_barcode[base_code.code]) {
					weight = this.env.pos.db.product_packaging_by_barcode[base_code.code].qty;
				}

				return { draftPackLotLines, quantity: weight, description, price_extra };
			}

			async _barcodeProductAction(code) {
				let check = await this.scan_prod_barcode(code.code)
				if(check == false){
					super._barcodeProductAction(code);
				}
			}

			async scan_prod_barcode (parsed_code){
				let self = this;
				let selectedOrder = this.env.pos.get_order();
				let prod_added = false;
				
				await self.rpc({
					model: 'product.weight.barcode',
					method: 'search_read',
					args: [[['barcode', '=', parsed_code]], ['barcode','weight','product_id']],
				}).then(function (barcode){
					if(barcode.length > 0){
						barcode = barcode[0];
						let product = self.env.pos.db.get_product_by_id(barcode.product_id[0]);
						if(product){
							selectedOrder.add_product(product,{quantity:barcode.weight});
							prod_added =  true;
						}
					}
				});
				return prod_added;
			}

		};

	Registries.Component.extend(ProductScreen, BiProductScreen);
	return ProductScreen;

});
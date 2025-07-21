# -*- coding: utf-8 -*-
# Part of BrowseInfo. See LICENSE file for full copyright and licensing details.

{
	'name': 'POS Weight Barcode on Screen',
	'version': '18.0.0.0',
	'category': 'Point of Sale',
	'summary': 'POS generate weight barcode on point of sale screen pos weight barcode pos screen weight barcode point of sale weight barcode point of sale screen weight barcode POS Weight Screen with Barcode point of sale Weight Screen Barcode generate pos weight barcode',
	'description' :"""
		This odoo app helps user to generate weight barcode for product from point of sale screen, User can configure product to generate barcode and enter weight for selected product, product price will automatically calculated according to weight and generate weight barcode, User can scan weight barcode in point of sale and product will added with weight and price from barcode.
	""",
	'author': 'BROWSEINFO',
	'website': 'https://www.browseinfo.com/demo-request?app=bi_pos_weight_barcode&version=18&edition=Community',
	"price": 49,
	"currency": 'EUR',
	'depends': ['base','point_of_sale'],
	'data': [
		'security/ir.model.access.csv',
		'views/pos_view.xml',
	],
	'assets': {
		'point_of_sale._assets_pos': [
			'bi_pos_weight_barcode/static/src/css/pos.scss',
   			'bi_pos_weight_barcode/static/src/app/JsBarcode.all.min.js',
			'bi_pos_weight_barcode/static/src/app/models.js',
			'bi_pos_weight_barcode/static/src/app/posStore.js',
			"bi_pos_weight_barcode/static/src/app/Screens/ProductScreen.js",
			"bi_pos_weight_barcode/static/src/app/Screens/BiScaleScreen.js",
			"bi_pos_weight_barcode/static/src/app/Screens/WBReceiptScreen.js",
			"bi_pos_weight_barcode/static/src/app/Screens/WBReceipt.js",
			'bi_pos_weight_barcode/static/src/xml/pos.xml',
		],
	},
	'demo': [],
	'test': [],
	'installable': True,
	'auto_install': False,
	'live_test_url':'https://www.browseinfo.com/demo-request?app=bi_pos_weight_barcode&version=18&edition=Community',
	"images":['static/description/Banner.gif'],
	'license': 'OPL-1',
}

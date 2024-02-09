# -*- coding: utf-8 -*-
# Part of BrowseInfo. See LICENSE file for full copyright and licensing details.

{
	'name': 'POS Weight Barcode on Screen',
	'version': '15.0.0.0',
	'category': 'Point of Sale',
	'summary': 'POS generate weight barcode on point of sale screen pos weight barcode pos screen weight barcode point of sale weight barcode point of sale screen weight barcode POS Weight Screen with Barcode point of sale Weight Screen Barcode generate pos weight barcode',
	'description' :"""
		This odoo app helps user to generate weight barcode for product from point of sale screen, User can configure product to generate barcode and enter weight for selected product, product price will automatically calculated according to weight and generate weight barcode, User can scan weight barcode in point of sale and product will added with weight and price from barcode.
	""",
	'author': 'BrowseInfo',
	'website': 'https://www.browseinfo.com',
	"price": 49,
	"currency": 'EUR',
	'depends': ['base','point_of_sale'],
	'data': [
		'security/ir.model.access.csv',
		'views/pos_view.xml',
	],
	'assets': {
		'point_of_sale.assets': [
			'bi_pos_weight_barcode/static/src/css/pos.css',
			'bi_pos_weight_barcode/static/src/js/models.js',
            'bi_pos_weight_barcode/static/src/js/jquery-barcode.js',
			"bi_pos_weight_barcode/static/src/js/Screens/BiScaleScreen.js",
			"bi_pos_weight_barcode/static/src/js/Screens/ProductScreen.js",
			"bi_pos_weight_barcode/static/src/js/Screens/WBReceiptScreen.js",
			"bi_pos_weight_barcode/static/src/js/Screens/WBReceipt.js",
		],
		'web.assets_qweb': [
			'bi_pos_weight_barcode/static/src/xml/**/*',
		],
	},
	'demo': [],
	'test': [],
	'installable': True,
	'auto_install': False,
	'live_test_url':'https://youtu.be/Df7IKh3HBC0',
	"images":['static/description/Banner.png'],
	'license': 'OPL-1',
}

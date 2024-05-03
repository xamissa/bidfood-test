# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.
{
    'name': 'POS Indigo Iveri',
    'version': '1.0',
    'category': 'Sales/Point Of Sale ',
    'sequence': 6,
    'summary': 'Integrate your POS with an Indigo payment terminal',
    'description': '',
    'data': [
        'views/pos_config_views.xml',
        'views/pos_payment_method_views.xml',
        # 'views/point_of_sale_assets.xml',
    ],
    "assets": {
        'point_of_sale.assets': [
            'pos_iveri/static/src/js/models.js',
            'pos_iveri/static/src/js/payment_iveri.js',
            'pos_iveri/static/src/xml/**/*.xml',
        ],
    },
    'depends': ['point_of_sale'],
    # 'qweb': ['static/src/xml/pos.xml'],
    'installable': True,
    'license': 'AGPL-3',
   
}

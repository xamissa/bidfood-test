# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.
{
    'name': 'POS Indigo Iveri',
    'version': '15.0',
    'category': 'Sales/Point Of Sale',
    'sequence': 6,
    'summary': 'Integrate your POS with an Indigo payment terminal',
    'description': '',
    'depends': ['point_of_sale'],
    'data': [
        'views/pos_config_views.xml',
        'views/pos_payment_method_views.xml',
    ],

    'assets': {        
        'point_of_sale.assets': [
            'pos_iveri_15/static/src/js/models.js',       
            'pos_iveri_15/static/src/js/payment_iveri.js',
            'pos_iveri_15/static/src/js/refundbutton.js',
            'pos_iveri_15/static/src/css/pos.css',
        ],
        'web.assets_qweb': [
            'pos_iveri_15/static/src/xml/*',
        ],
    },
    'installable': True,
    'auto_install': False,
   
}

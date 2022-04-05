# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.
{
    'name': 'BidFood',
    'version': '1.0 ',
    'category': 'Sales',
    'sequence': 6,
    'summary': 'Integrate your Odoo with an Bidfood',
    'description': '',
    'data': [
            'security/ir.model.access.csv',
          'views/bidfood_views.xml',
          'views/ir_sequence.xml',
        'views/product_views.xml',
      
    ],
     'assets': {

        'point_of_sale.assets': [
            'bidfood_custom/static/src/js/models.js',
            ],
        'web.assets_qweb': [
           'bidfood_custom/static/src/xml/**/*',
        ],
    },
    'depends': ['point_of_sale'],
    'qweb': [''],
    'installable': True,
    'license': 'LGPL-3',
   
}

{
    'name': 'POS Combo Pro',
    'version': '15.0.1.0.0',
    'depends': ['point_of_sale'],
    'assets': {
        'point_of_sale.assets': [
            'pos_combo_pro/static/src/js/combo.js',
            #'pos_combo_pro/static/src/xml/combo_button.xml',
        ],
        'web.assets_qweb': [
            'pos_combo_pro/static/src/xml/**/*',
        ],
    },
    'data': [
        'views/product_view.xml',
    ],
    'installable': True,
}
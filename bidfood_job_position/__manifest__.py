{
    "name": "BidFood Job Position",
    "summary": """ Job Position""",
    "images": [],
    "version": "15.0.1",
    "depends": ["base", "point_of_sale", "contacts"],
    "data": [
        'security/ir.model.access.csv',
        'views/job_position.xml',
    ],
    'assets': {
        'point_of_sale.assets': [
            'bidfood_job_position/static/src/js/models.js',
            'bidfood_job_position/static/src/js/ClientDetailsEdit.js',
            'bidfood_job_position/static/src/js/PaymentScreen.js',
        ],
        'web.assets_qweb': [
            'bidfood_job_position/static/src/xml/*',
        ],
    },  
    "auto_install": True,
    "installable": True,
    "license" : "OPL-1",
}

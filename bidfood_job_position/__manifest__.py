{
    "name": "BidFood Job Position",
    "summary": """ Job Position""",
    "images": [],
    "version": "18.0",
    "depends": ["base", "point_of_sale", "contacts"],
    "data": [
        'security/ir.model.access.csv',
        'views/job_position.xml',
    ],
    'assets': {
        'point_of_sale._assets_pos': [
            'bidfood_job_position/static/src/**/*',
        ],
    },  
    "auto_install": True,
    "installable": True,
    "license" : "OPL-1",
}

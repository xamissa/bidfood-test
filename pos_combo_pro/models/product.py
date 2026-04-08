from odoo import models, fields

class ProductTemplate(models.Model):
    _inherit = 'product.template'

    is_combo = fields.Boolean("Is Combo")
    combo_price = fields.Float("Combo Price")
    combo_item_ids = fields.Many2many(
        'product.product',
        string="Combo Items"
    )
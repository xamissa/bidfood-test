# coding: utf-8
# Part of Odoo. See LICENSE file for full copyright and licensing details.
import logging

from odoo import api, fields, models, _
from odoo.exceptions import ValidationError

_logger = logging.getLogger(__name__)


class PosConfig(models.TransientModel):
    _inherit = 'res.config.settings'

    iveri_ask_customer_for_tip = fields.Boolean('Ask Customers For Tip', help='Prompt the customer to tip.')

    @api.constrains('iveri_ask_customer_for_tip', 'pos_iface_tipproduct', 'pos_tip_product_id')
    def _check_iveri_ask_customer_for_tip(self):
        for config in self:
            if config.iveri_ask_customer_for_tip and (not config.pos_tip_product_id or not config.pos_iface_tipproduct):
                raise ValidationError(_("Please configure a tip product for POS %s to support tipping with iveri.") % config.pos_config_id)

    @api.onchange('iveri_ask_customer_for_tip')
    def _onchange_iveri_ask_customer_for_tip(self):
        for config in self:
            if config.iveri_ask_customer_for_tip:
                config.pos_iface_tipproduct = True

    def set_values(self):
        res = super(PosConfig,self).set_values()
        set_value = self.env['ir.config_parameter'].sudo()
        set_value.set_param('pos_iveri.iveri_ask_customer_for_tip',self.iveri_ask_customer_for_tip)
        return res

    @api.model
    def get_values(self):
        res = super(PosConfig,self).get_values()
        set_value = self.env['ir.config_parameter'].sudo()
        iveri_ask_customer_for_tip = set_value.get_param('pos_iveri.iveri_ask_customer_for_tip')
        res.update(iveri_ask_customer_for_tip = iveri_ask_customer_for_tip)
        return res

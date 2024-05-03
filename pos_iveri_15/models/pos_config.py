# coding: utf-8
# Part of Odoo. See LICENSE file for full copyright and licensing details.
import logging

from odoo import api, fields, models, _
from odoo.exceptions import ValidationError

_logger = logging.getLogger(__name__)


class PosConfig(models.Model):
    _inherit = 'pos.config'

    iveri_ask_customer_for_tip = fields.Boolean('Ask Customers For Tip', help='Prompt the customer to tip.')

    @api.constrains('iveri_ask_customer_for_tip', 'iface_tipproduct', 'tip_product_id')
    def _check_iveri_ask_customer_for_tip(self):
        for config in self:
            if config.iveri_ask_customer_for_tip and (not config.tip_product_id or not config.iface_tipproduct):
                raise ValidationError(_("Please configure a tip product for POS %s to support tipping with iveri.") % config.name)

    @api.onchange('iveri_ask_customer_for_tip')
    def _onchange_iveri_ask_customer_for_tip(self):
        for config in self:
            if config.iveri_ask_customer_for_tip:
                config.iface_tipproduct = True
class PosRefundOrder(models.Model):
    _inherit = 'pos.order'

    refund_order = fields.Char(string='Refunded Order', compute='_compute_refund_order')

    @api.depends('lines.refund_orderline_ids', 'lines.refunded_orderline_id')
    def _compute_refund_order(self):
        for order in self:
            order.refund_order = order.mapped('lines.refunded_orderline_id.order_id.pos_reference')
            order.refund_order = str(order.refund_order)[2:-2]

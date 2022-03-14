# coding: utf-8
# Part of Odoo. See LICENSE file for full copyright and licensing details.
import json
import logging
import pprint
import random
import requests
import string
import requests
import json
from dateutil.parser import parse
from requests.structures import CaseInsensitiveDict
from odoo import fields, models, api, _
from odoo.exceptions import ValidationError
_logger = logging.getLogger(__name__)


class pos_session(models.Model):
    _inherit = "pos.session"
    
    def action_pos_session_close(self, balancing_account=False, amount_to_balance=0, bank_payment_method_diffs=None):
        res= super(pos_session, self).action_pos_session_close(balancing_account, amount_to_balance,bank_payment_method_diffs)
        orders = self.order_ids.filtered(lambda o: o.state == 'paid' or o.state == 'invoiced')
        print("+<<<<<<<<<<<<<<<<<<",res,self.order_ids)
        data=self.env['bidfood.sale'].search([],limit=1).bidfood_sale_order(self.order_ids)
        return res

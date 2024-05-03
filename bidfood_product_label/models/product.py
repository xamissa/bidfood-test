# -*- coding: utf-8 -*-

from odoo import fields, models, api, _
from odoo.tools import format_amount
import logging
_logger = logging.getLogger(__name__)
import re

class Productemplate(models.Model):
    _inherit = 'product.template'

    @api.depends('taxes_id', 'list_price')
    def get_tax_price(self):
        for rec in self:
            currency = rec.currency_id
            amt = 0
            if rec.taxes_id:
                res = rec.taxes_id.compute_all(rec.list_price, product=self, partner=self.env['res.partner'])
                included = res['total_included']
                if currency.compare_amounts(included, rec.list_price):
                    amt = format_amount(self.env, included, currency)
                excluded = res['total_excluded']
                if currency.compare_amounts(excluded, rec.list_price):
                    amt = format_amount(self.env, excluded, currency)
            else:
                amt = rec.list_price
            return amt

    @api.depends('taxes_id', 'list_price')
    def get_tax_price_zpl(self):
        for rec in self:
            currency = rec.currency_id
            amt = 0
            if rec.taxes_id:
                res = rec.taxes_id.compute_all(rec.list_price, product=self, partner=self.env['res.partner'])
                included = res['total_included']
                if currency.compare_amounts(included, rec.list_price):
                    amt = format_amount(self.env, included, currency)
                excluded = res['total_excluded']
                if currency.compare_amounts(excluded, rec.list_price):
                    amt = format_amount(self.env, excluded, currency)
                trim = re.compile(r'[^\d.,]+')
                amt = trim.sub('', amt)
            else:
                amt = rec.list_price
            return float(amt)

class ProductProduct(models.Model):
    _inherit = 'product.product'

    @api.depends('lst_price', 'taxes_id')
    def get_tax_price(self):
        for rec in self:
            currency = rec.currency_id
            amt = 0
            if rec.taxes_id:
                res = rec.taxes_id.compute_all(rec.lst_price, product=self, partner=self.env['res.partner'])
                included = res['total_included']
                if currency.compare_amounts(included, rec.lst_price):
                    amt = format_amount(self.env, included, currency)
                excluded = res['total_excluded']
                if currency.compare_amounts(excluded, rec.lst_price):
                    amt = format_amount(self.env, excluded, currency)
            else:
                amt = rec.list_price
            return amt

    @api.depends('lst_price', 'taxes_id')
    def get_tax_price_zpl(self):
        for rec in self:
            currency = rec.currency_id
            amt = 0
            if rec.taxes_id:
                res = rec.taxes_id.compute_all(rec.lst_price, product=self, partner=self.env['res.partner'])
                included = res['total_included']
                if currency.compare_amounts(included, rec.lst_price):
                    amt = format_amount(self.env, included, currency)
                excluded = res['total_excluded']
                if currency.compare_amounts(excluded, rec.lst_price):
                    amt = format_amount(self.env, excluded, currency)
                trim = re.compile(r'[^\d.,]+')
                amt = trim.sub('', amt)
            else:
                amt = rec.list_price
            return float(amt)
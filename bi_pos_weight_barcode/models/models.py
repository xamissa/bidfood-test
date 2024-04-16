# -*- coding: utf-8 -*-
# Part of BrowseInfo. See LICENSE file for full copyright and licensing details.

from odoo import api, fields, models, _


class PosConfigInherit(models.Model):
	_inherit = 'pos.config'

	is_weight_scale_screen = fields.Boolean("Weight Scale Screen")


class ProductInherit(models.Model):
	_inherit = 'product.product'

	product_barcode = fields.One2many('product.weight.barcode', 'product_id',string='Product weight Barcodes')

	def create_weight_barcode(self,barcode,weight,ssn):
		rec = self.env['product.weight.barcode'].sudo().create({
			'product_id' : self.id,
			'barcode' : barcode,
			'product_tmpl_id' : self.product_tmpl_id.id,
			'weight' : weight,
			'uom_id' : self.uom_id.id,
			'session_id' : int(ssn),
		})
		return rec


class Barcode(models.Model):
	_name = 'product.weight.barcode'
	_description = "Product Weight Barcode"

	product_id = fields.Many2one('product.product')
	barcode = fields.Char(string='Barcode',required=True)
	product_tmpl_id = fields.Many2one('product.template')
	weight = fields.Float("Weight")
	uom_id = fields.Many2one("uom.uom","Units")
	session_id = fields.Many2one("pos.session")

	_sql_constraints = [
		('uniq_barcode', 'unique(barcode)', "A barcode can only be assigned to one product !"),
	]

	def get_barcode_data(self,parsed_code):
		rec = self.search([('barcode','=',parsed_code)],limit=1)
		data = rec.read(['barcode','weight','product_id'])
		return data
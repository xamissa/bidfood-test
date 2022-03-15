#!/usr/bin/python
# -*- coding: utf-8 -*-

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


class Productemplate(models.Model):

    _inherit = 'product.template'
    gp_unit = fields.Char(string='GP Unit')


class product_big(models.Model):

    _name = 'product.big'
    _description = 'Product Big'

    name = fields.Char(string='Name')
    log_ids = fields.One2many('product.big.log', 'product_big',
                              string='Logs')

    @api.model
    def create(self, vals):
        """
        This method is create for sequence wise name.
        :param vals: values
        :return:super
        """

        seq = self.env['ir.sequence'
                       ].next_by_code('common.log.book.food') or '/'
        vals['name'] = seq
        return super(product_big, self).create(vals)


class product_big_log(models.Model):

    _name = 'product.big.log'
    _description = 'Product Big Log'

    name = fields.Char(string='Name')
    payload = fields.Text(string='Payload')
    error = fields.Text(string='Error')
    ttype = fields.Selection([('create', 'Create'), ('update', 'Update'
                             )], string='Operation')
    etype = fields.Selection([('fail', 'Fail'), ('done', 'Done')],
                             string='State')
    product_big = fields.Many2one('product.big', string='Product Big')


class bidfood_sale(models.Model):

    _name = 'bidfood.sale'
    _description = 'BidFood Sale'
    _inherit = ['portal.mixin', 'mail.thread', 'mail.activity.mixin',
                'utm.mixin']
    name = fields.Char(string='UserName', copy=False)
    password = fields.Char(string='Password', copy=False)
    token = fields.Char(string='Token', copy=False, readonly=True)
    url = fields.Char(string='URL', copy=False,
                      default='https://pos.bidfood.co.za/api/Product/authentication'
                      )

    def bidfood_token(self):
        headers = {'Content-Type': 'application/json'}
        url='https://pos.bidfood.co.za/api/Product/authentication'
        payload = json.dumps({'userName': self.name,
                             'password': self.password})
        resp = requests.post(url, headers=headers, data=payload)

        if resp.status_code == 200:

            self.token = resp.text
            self.message_post(body=_('Token Generated'))
        else:
            self.message_post(body=_('Token Error '))
        return resp.text

    def bidfood_product(self):
        payload = {}
        url = 'https://pos.bidfood.co.za/api/Product'
        self.bidfood_token()
        headers = {'Authorization': 'Bearer %s' % self.token}
        resp = requests.request('GET', url, headers=headers,
                                data=payload)
        if resp.status_code == 200:
            res = resp.json()
            create_product = []
            update_product = []
            for r in res:
                product = self.env['product.template'
                                   ].search([('default_code', '=',
                        r['internal_Reference'].strip())],
                        order='id desc', limit=1)
                if not product:
                    create_product.append(r)
                if product:
                    r.update({'product_id': product.id})
                    update_product.append(r)
            if create_product:
                self.bidfood_product_create(create_product)
            if update_product:
                self.bidfood_product_update(update_product)
            self.message_post(body=_('Product Fetch Succefully'))
        else:
            self.message_post(body=_('Error%s', resp.text))
        return True

    def bidfood_product_create(self, create_product):
        product = self.env['product.template']
        product_log = self.env['product.big.log']
        product_categ_obj = self.env['pos.category']
        product_big = self.env['product.big'].create({'name': 'Test'})
        for r in create_product:
            barcode = ''
            to_weight = False
            if r['barcode']:
              barcode =r['barcode'].strip()
            if r['rndwght'] != 0:
                to_weight = True
            categ_id = product_categ_obj.search([('name', '=',
                    r['product_category'])])
            if categ_id:
                categ_id = categ_id.id
            else:
                categ_id = \
                    product_categ_obj.create({'name': r['product_category'
                        ]}).id
            val = {
                'name': r['product_name'],
                'active': True,
                'default_code': r['internal_Reference'].strip(),
                'list_price': r['cost'],
                'gp_unit': r['unit_of_measure'],
                'type': 'consu',
                'to_weight': to_weight,
                'detailed_type': 'consu',
                'available_in_pos': True,
                'pos_categ_id': categ_id,
                }
            if barcode:
                val.update({'barcode': barcode})

            try:
                product.create(val)
                log_book_id = product_log.create({
                    'name': r['product_name'],
                    'product_big': product_big.id,
                    'etype': 'done',
                    'ttype': 'create',
                    'payload': r,
                    })
            except Exception as error:
                log_book_id = product_log.create({
                    'name': r['product_name'],
                    'product_big': product_big.id,
                    'etype': 'fail',
                    'ttype': 'create',
                    'payload': r,
                    'error': str(error),
                    })

        return True

    def bidfood_product_update(self, create_product):
        product = self.env['product.template']
        product_log = self.env['product.big.log']
        product_categ_obj = self.env['pos.category']
        product_big = self.env['product.big'].create({'name': 'Test'})
        for r in create_product:
            val = {}
            barcode = ''
            temp = ''
            product = self.env['product.template'].browse(r['product_id'
                    ])
            to_weight = False
            if r['barcode'] :
                temp = r['barcode'].strip()
            int_ref = r['internal_Reference'].strip()
            #if product.barcode and product.barcode != temp:
            if (temp or product.barcode) and  (product.barcode != temp or product.barcode not in (False,'')):
                barcode = r['barcode'].strip()
                val.update({'barcode': barcode})
            categ_id = product_categ_obj.search([('name', '=',
                    r['product_category'])])
            if categ_id:
                categ_id = categ_id.id
            else:
                categ_id = \
                    product_categ_obj.create({'name': r['product_category'
                        ]}).id

            # val={'name':r['product_name'] ,'active': True, 'default_code': r['internal_Reference'], 'list_price': r['cost'], 'gp_unit': r['unit_of_measure'],'type':'product','to_weight':to_weight,'detailed_type':'product','available_in_pos':True,'pos_categ_id':categ_id}

            if product.name != r['product_name']:
                val.update({'name': r['product_name']})
            if product.default_code != int_ref:
                val.update({'default_code': int_ref})
            if product.list_price != r['cost']:
                val.update({'list_price': r['cost']})
            if product.gp_unit != r['unit_of_measure']:
                val.update({'gp_unit': r['unit_of_measure']})

           # if product.to_weight != to_weight:
           #   val.update({'to_weight':to_weight})

            if product.pos_categ_id.id != int(categ_id):
                val.update({'pos_categ_id': int(categ_id)})
            if product.available_in_pos != True:
                val.update({'available_in_pos': True})

            try:
                if val:
                    product.write(val)
                    log_book_id = product_log.create({
                        'name': product.name,
                        'product_big': product_big.id,
                        'etype': 'done',
                        'ttype': 'update',
                        'payload': r,
                        })
            except Exception as error:
                log_book_id = product_log.create({
                    'name': product.name,
                    'product_big': product_big.id,
                    'etype': 'fail',
                    'ttype': 'update',
                    'payload': r,
                    'error': str(error),
                    })
        return True

    def bidfood_sale_order(self, orders):
        data_push = ''
        con=''
        
        for pos in orders:
            data={}
            data = {'posSalesOrderNr': pos.pos_reference,
                    'branch':"BVPOL", #pos.session_id.config_id.name,
                    'docType': 3,
                    'docId':pos.pos_reference,
                    'SOPNUMBE':pos.name,
                    'TAXSCHID':'OUTPUTVAT - 15%',
                    'DOCDATE':pos.date_order.strftime("%d.%m.%Y"),#pos.date_order,
                    'CUSTNMBR':pos.partner_id.ref,
                    'SUBTOTAL':pos.amount_total - pos.amount_tax,
                    'DOCAMNT':pos.amount_total,
                    'PYMTRCVD':pos.amount_paid,
                    'TAXAMNT':pos.amount_tax,}
            order_line = []
            for line in pos.lines:
                line_dict = {'itemCode': (line.product_id.default_code).strip(),
                             'itemDescription': line.product_id.name,
                             'quantity': line.qty}
                order_line.append(line_dict)
                
            data['invoiceLines']=order_line
            #data_push.append(data)
            data_push = json.dumps(data)
            self.bidfood_send(data_push)
        return True
    def bidfood_send(self, payload):
        product_big = self.env['product.big'].create({'name': 'Test'})
        url = 'https://pos.bidfood.co.za/api/Invoice'
        self.bidfood_token()
        print(self)
        headers = {'Authorization': 'Bearer %s' % self.token,'Content-Type': 'application/json'
}

        response = requests.request("POST", url, headers=headers, data=payload)
        print("********respresp********",response.text, response.status_code)  
        product_log = self.env['product.big.log']
        if res.get('response') == 'Success':
             log_book_id = product_log.create({
                        'name':'BVPOL',
                        'product_big': product_big.id,
                        'etype': 'done',
                        'ttype': 'create',
                        'payload': payload,
                        })
        else:
            log_book_id = product_log.create({
                    'name': product.name,
                    'product_big': product_big.id,
                    'etype': 'fail',
                    'ttype': 'create',
                    'payload': payload,
                    'error': str(response.text),
                    })
        return True


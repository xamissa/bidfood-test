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


class Productemplate(models.Model):
    _inherit = "product.template"
    gp_unit = fields.Char(string="GP Unit")
    
class product_big_log(models.Model):
    _name = "product.big.log"
    name = fields.Char(string="Name")
    payload = fields.Text(string="Payload")
    error = fields.Text(string="Error")
    type = fields.Selection([('import', 'Import'), ('export', 'Export')], string="Operation")


class bidfood_sale(models.Model):
    _name = 'bidfood.sale'
    _inherit = ['portal.mixin', 'mail.thread', 'mail.activity.mixin', 'utm.mixin']
    name = fields.Char(string="UserName", copy=False)
    password = fields.Char(string="Password", copy=False)
class bidfood_sale(models.Model):
    _name = 'bidfood.sale'
    _inherit = ['portal.mixin', 'mail.thread', 'mail.activity.mixin', 'utm.mixin']
    name = fields.Char(string="UserName", copy=False)
    password = fields.Char(string="Password", copy=False)
    token = fields.Char(string="Token", copy=False,readonly=True)
    url = fields.Char(string="URL", copy=False,default="https://pos.bidfood.co.za/api/Product/authentication")

        
    def bidfood_token(self):
        headers={"Content-Type":"application/json"}
        payload = json.dumps({
  "userName": self.name,
  "password":self.password
})
        resp = requests.post(self.url, headers=headers, data=payload)

        if resp.status_code==200:

           self.token=resp.text
           self.message_post(body=_("Token Generated") ) 
        else:
           self.message_post(body=_("Token Error "))  
        return resp.text
        
    def bidfood_product(self):
        payload={}
        url = "https://pos.bidfood.co.za/api/Product"
        self.bidfood_token()
        headers={"Authorization": "Bearer %s" %self.token}
        resp = requests.request("GET", url, headers=headers, data=payload)
        if resp.status_code==200:
           res=resp.json()
           create_product=[]
           update_product=[]
           for r in res:
              product=self.env['product.template'].search([('default_code','=',r['internal_Reference'])],order="id desc", limit=1)
              if not product:
                 create_product.append(r)
              if product:
                  r.update({'product_id':product.id})
                  update_product.append(r)
           self.bidfood_product_create(create_product)
           self.bidfood_product_uppdate(update_product)
           self.message_post(body=_("Product Fetch Succefully") ) 
        else:
           self.message_post(body=_("Error%s",resp.text)) 
        return True

    def bidfood_product_create(self,create_product):
        product=self.env['product.template']
        product_categ_obj = self.env['pos.category']
        for r in create_product:
           barcode=''
           to_weight=False
           if r['barcode'].strip() :
              barcode =r['barcode']
           if r['rndwght']!=0:
              to_weight=True
           categ_id = product_categ_obj.search([('name', '=', r['product_category'])])
           if categ_id:
              categ_id=categ_id.id
           else:
              categ_id = product_categ_obj.create({'name': r['product_category']}).id
           val={'name':r['product_name'] ,'active': True, 'default_code': r['internal_Reference'], 'list_price': r['cost'], 'gp_unit': r['unit_of_measure'],'type':'product','to_weight':to_weight,'detailed_type':'product','available_in_pos':True,'pos_categ_id':categ_id}
           if barcode:
             val.update({'barcode':barcode})
           product.create(val)
        return True
      
    def bidfood_product_update(self,create_product):
        product=self.env['product.template']
        product_categ_obj = self.env['pos.category']
        for r in create_product:
           barcode=''
           product=self.env['product.template'].r['product_id']
           to_weight=False
           if r['barcode'].strip() :
              barcode =r['barcode']
           if r['rndwght']!=0:
              to_weight=True
           categ_id = product_categ_obj.search([('name', '=', r['product_category'])])
           if categ_id:
              categ_id=categ_id.id
           else:
              categ_id = product_categ_obj.create({'name': r['product_category']}).id
              
           val={'name':r['product_name'] ,'active': True, 'default_code': r['internal_Reference'], 'list_price': r['cost'], 'gp_unit': r['unit_of_measure'],'type':'product','to_weight':to_weight,'detailed_type':'product','available_in_pos':True,'pos_categ_id':categ_id}
             
           if barcode:
             val.update({'barcode':barcode})
           product.write(val)
        return True  

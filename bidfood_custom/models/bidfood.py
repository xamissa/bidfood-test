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

class Productemplate(models.Model):
    _inherit = "product.template"
    gp_unit = fields.Char(string="GP Unit")
    
_logger = logging.getLogger(__name__)

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
           for r in res:
              product=self.env['product.template'].search([('default_code','=',r['internal_Reference'])],order="id desc", limit=1)
              if not product:
                 create_product.append(r)
           self.bidfood_product_create(create_product)
           self.message_post(body=_("Product Fetch") ) 
        else:
           self.message_post(body=_("Error%s",resp.text)) 
        return True

    def bidfood_product_create(self,create_product):
        product=self.env['product.template']
        product_categ_obj = self.env['product.category']
        for r in create_product:
           categ_id = product_categ_obj.search([('name', '=', r['product_category'])])
           if categ_id:
              categ_id=categ_id.id
           else:
              categ_id = product_categ_obj.create({'name': r['product_category']}).id
           product.create({'name':r['product_name'] ,'active': True, 'default_code': r['internal_Reference'], 'list_price': r['cost'], 'gp_unit': r['unit_of_measure'],'categ_id':categ_id,'type':'product'})
        print("************bidfood_product_create******")
        return True

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

           print("=================",resp)
           self.token=resp.text
           self.message_post(body=_("Token Generated") ) 
        else:
           self.message_post(body=_("Token Error "))  
        return True
    def bidfood_product(self):
        url = "https://pos.bidfood.co.za/api/Product"
        #headers={"Content-Type":"application/json"}
        payload={}
        headers = {		"type": "text",
  'Authorization': self.token
}
        resp = requests.request("GET", url, headers=headers, data=payload)
        print("+++++++++++++++++++++",resp.status_code)
        if resp.status_code==200:
           print(response.text)
           self.token=resp.text
           self.message_post(body=_("Product Fetch") ) 
        else:
           self.message_post(body=_("Error%s",resp.text))  
        return True

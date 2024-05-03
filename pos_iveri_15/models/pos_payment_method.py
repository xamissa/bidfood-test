# coding: utf-8
# Part of Odoo. See LICENSE file for full copyright and licensing details.
import json
import logging
import pprint
import random
import requests
import string

from odoo import fields, models, api, _
from odoo.exceptions import ValidationError

_logger = logging.getLogger(__name__)

class PosPaymentMethod(models.Model):
    _inherit = 'pos.payment.method'

    def _get_payment_terminal_selection(self):
        return super(PosPaymentMethod, self)._get_payment_terminal_selection() + [('iveri', 'Iveri')]

    iveri_api_key = fields.Char(string="Iveri API key", help='Used when connecting to Iveri: https://docs.iveri.com/user-management/how-to-get-the-api-key/#description', copy=False)
    iveri_terminal_identifier = fields.Char(help='[Terminal model]-[Serial number], for example: P400Plus-123456789', copy=False)
    iveri_test_mode = fields.Boolean(help='Run transactions in the test environment.')
    iveri_latest_response = fields.Char(help='Technical field used to buffer the latest asynchronous notification from Iveri.', copy=False, groups='base.group_erp_manager')
    iveri_latest_diagnosis = fields.Char(help='Technical field used to determine if the terminal is still connected.', copy=False, groups='base.group_erp_manager')

    @api.constrains('iveri_terminal_identifier')
    def _check_iveri_terminal_identifier(self):
        for payment_method in self:
            if not payment_method.iveri_terminal_identifier:
                continue
            existing_payment_method = self.search([('id', '!=', payment_method.id),
                                                   ('iveri_terminal_identifier', '=', payment_method.iveri_terminal_identifier)],
                                                  limit=1)
            if existing_payment_method:
                raise ValidationError(_('Terminal %s is already used on payment method %s.')
                                      % (payment_method.iveri_terminal_identifier, existing_payment_method.display_name))

    def _is_write_forbidden(self, fields):
        whitelisted_fields = set(('iveri_latest_response', 'iveri_latest_diagnosis'))
        return super(PosPaymentMethod, self)._is_write_forbidden(fields - whitelisted_fields)

    def _iveri_diagnosis_request_data(self, pos_config_name, terminal_identifier):
        #service_id = ''.join(random.choices(string.ascii_letters + string.digits, k=10))
        service_id = ''.join(random.choices(string.ascii_letters + string.digits, k=10))
        return {

            "Command": "Debit",
            "DeviceSerialNumber":81536781, 
 "Terminal" : 'Admiin',
  'Amount': 100,
  "MerchantReference":'test',
            "SaleToPOIRequest": {
                "MessageHeader": {
                    "ProtocolVersion": "3.0",
                    "MessageClass": "Service",
                    "MessageCategory": "Diagnosis",
                    "MessageType": "Request",
                    "ServiceID": service_id,
                    "SaleID": pos_config_name,
                    "POIID": terminal_identifier,
                },
                "DiagnosisRequest": {
                    "HostDiagnosisFlag": False
                }
            }
        }
        

    @api.model
    def get_latest_iveri_status(self, payment_method_id, pos_config_name, terminal_identifier, test_mode, api_key):
        '''See the description of proxy_iveri_request as to why this is an
        @api.model function.
        '''

        # Poll the status of the terminal if there's no newl
        # notification we received. This is done so we can quickly
        # notify the user if the terminal is no longer reachable due
        # to connectivity issues.
        #self.proxy_iveri_request(self._iveri_diagnosis_request_data(pos_config_name, terminal_identifier), test_mode,api_key)

                                
        payment_method = self.sudo().browse(payment_method_id)
        latest_response = payment_method.iveri_latest_response
        #latest_response = json.loads(latest_response) if latest_response else False
    
        #payment_method.iveri_latest_response = ''  # avoid handling old responses multiple times

        return {
            'latest_response': latest_response,
            'last_received_diagnosis_id': payment_method.iveri_latest_diagnosis,
        }



    @api.model
    def proxy_iveri_request(self, data, test_mode, api_key):
        '''Necessary because Iveri's endpoints don't have CORS enabled. This is an
        @api.model function to avoid concurrent update errors. Iveri's
        async endpoint can still take well over a second to complete a
        request. By using @api.model and passing in all data we need from
        the POS we avoid locking the pos_payment_method table. This way we
        avoid concurrent update errors when Iveri calls us back on
        /pos_iveri/notification which will need to write on
        pos.payment.method.
        '''
        TIMEOUT = 1000
        #endpoint = 'https://196,13.126.201:9080/rest/transaction/transact'
        #endpoint = 'https://terminal-api-live.iveri.com/async'
        #if test_mode:
        endpoint = 'https://ingenico.indigo.iveri.net/rest/transaction/transact'
        #endpoint = 'https://indigonendbank.iveri.com:9080/rest/transaction/transact'
        #endpoint='https://indigonedbank.iveri.com:9080/rest/transaction/transact'

        _logger.info('request to iveri\n%s', pprint.pformat(data))
        headers = {
            #'x-api-key': api_key,
            'Content-Type': 'application/json'
        }
        req = requests.post(endpoint, data=json.dumps(data), headers=headers, timeout=TIMEOUT)
        _logger.info('responsie from iveri (HTTP status %s)=====================%s======:\n%s', req.status_code, req.text)
        ret={}
        if req.status_code!=405:
            ret=req.json()
        


        _logger.info("==========%s========resule  ===%s",ret,ret.get('ResultCode'))
        if 'Result' in ret and ret.get('Result')['Code'] !='0' and 'Description' in ret and  ret.get('Result')['Description']=='Void Approved':
           return ret.json()
           

        if ret.get('ResultCode') =="0":
            _logger.info('====================reset %s==ressueee====',self)
            dt=self.browse(ret.get('payment_method'))
            dt.sudo().write({'iveri_latest_response':ret})
            _logger.info("dt%s",dt)
            return ret

        return req.json()

    @api.onchange('use_payment_terminal')
    def _onchange_use_payment_terminal(self):
        super(PosPaymentMethod, self)._onchange_use_payment_terminal()
        if self.use_payment_terminal != 'iveri':
            self.iveri_api_key = False
            self.iveri_terminal_identifier = False

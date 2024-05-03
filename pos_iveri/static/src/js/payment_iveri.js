odoo.define('pos_iveri.payment', function (require) {
"use strict";

var core = require('web.core');
var rpc = require('web.rpc');
var PaymentInterface = require('point_of_sale.PaymentInterface');
var { Gui } = require('point_of_sale.Gui');
var _t = core._t;

var PaymentIveri = PaymentInterface.extend({
    send_payment_request: function (cid) {
        this._super.apply(this, arguments);
        this._reset_state();
        return this._iveri_pay();
    },
    send_payment_cancel: function (order, cid) {
        this._super.apply(this, arguments);
        // set only if we are polling
        this.was_cancelled = !!this.polling;
        return this._iveri_void();
    },
    close: function () {
        this._super.apply(this, arguments);
    },

    // private methods
    _reset_state: function () {
        this.was_cancelled = false;
        this.last_diagnosis_service_id = false;
        this.remaining_polls = 2;
        clearTimeout(this.polling);
    },

    _handle_odoo_connection_failure: function (data) {
        // handle timeout
        var line = this.pos.get_order().selected_paymentline;
        if (line) {
            line.set_payment_status('waitingCard');
        }
        this._show_error(_('Could not connect to the Odoo server, please check your internet connection and try again.'));

        return Promise.reject(data); // prevent subsequent onFullFilled's from being called
    },

    _call_iveri: function (data) {
        var self = this;
        return rpc.query({
            model: 'pos.payment.method',
            method: 'proxy_iveri_request',
            args: [data, this.payment_method.iveri_test_mode, this.payment_method.iveri_api_key],
        }, {
            // When a payment terminal is disconnected it takes Iveri
            // a while to return an error (~6s). So wait 10 seconds
            // before concluding Odoo is unreachable.
            timeout: 100000,
            shadow: true,
        }).catch(this._handle_odoo_connection_failure.bind(this));
    },

    _iveri_get_sale_id: function () {
        var config = this.pos.config;
        return _.str.sprintf('%s (ID: %s)', config.display_name, config.id);
    },

    _iveri_common_message_header: function () {
        var config = this.pos.config;
        this.most_recent_service_id = Math.floor(Math.random() * Math.pow(2, 64)).toString(); // random ID to identify request/response pairs
        this.most_recent_service_id = this.most_recent_service_id.substring(0, 10); // max length is 10

        return {
            'ProtocolVersion': '3.0',
            'MessageClass': 'Service',
            'MessageType': 'Request',
            'SaleID': this._iveri_get_sale_id(config),
            'ServiceID': this.most_recent_service_id,
            'POIID': this.payment_method.iveri_terminal_identifier
        };
    },

    _iveri_pay_data: function () {
        var order = this.pos.get_order();
var user = this.pos.get_cashier();
        var config = this.pos.config;
        var line = order.selected_paymentline;
        var data = {

            "Command": "Debit",
 "DeviceSerialNumber": this.payment_method.iveri_terminal_identifier,
 "MerchantReference":order.name,
 'Amount': parseInt(line.amount*100),
 "Terminal" : user.name,


            'SaleToPOIRequest': {
                'MessageHeader': _.extend(this._iveri_common_message_header(), {
                    'MessageCategory': 'Payment',
                }),
                'PaymentRequest': {
                    'SaleData': {
                        'SaleTransactionID': {
                            'TransactionID': order.uid,
                            'TimeStamp': moment().format(), // iso format: '2018-01-10T11:30:15+00:00'
                        }
                    },
                    'PaymentTransaction': {
                        'AmountsReq': {
                            'Currency': this.pos.currency.name,
                            'RequestedAmount': line.amount,
                        }
                    }
        }
                }
            
        };

        if (config.iveri_ask_customer_for_tip) {
            data.SaleToPOIRequest.PaymentRequest.SaleData.SaleToAcquirerData = "tenderOption=AskGratuity";
        }

        return data;
    },

    _iveri_pay: function () {
        var self = this;
        var data = this._iveri_pay_data();
console.log("***************************datae before"+JSON.stringify(data));
        return this._call_iveri(data).then(function (data) {
            console.log("______ivery pay____data___"+JSON.stringify(data));
            return self._iveri_handle_response(data);
        });
    },

    _iveri_cancel: function (ignore_error) {
        var previous_service_id = this.most_recent_service_id;
        var order = this.pos.get_order();
var user = this.pos.get_cashier();
        var config = this.pos.config;
        var line = order.selected_paymentline;
        var header = _.extend(this._iveri_common_message_header(), {
            'MessageCategory': 'Abort',
        });

      var data = {
  "Command": "Void",
         "DeviceSerialNumber":  this.payment_method.iveri_terminal_identifier,
 "MerchantReference":order.name,
 'Amount': parseInt(line.amount*100),
 "Terminal" : user.name,

           'SaleToPOIRequest': {
                'MessageHeader': header,
                'AbortRequest': {
                    'AbortReason': 'MerchantAbort',
                    'MessageReference': {
                        'MessageCategory': 'Payment',
                        'SaleID': header.SaleID,
                        'ServiceID': previous_service_id,
                    }
                },
            }        };

        return this._call_iveri(data).then(function (data) {
            // Only valid response is a 200 OK HTTP response which is
            // represented by true.
            if ( this!="undefined" && data!="undefined" && ignore_error && data !== true ) {
                self._show_error(_('Cancelling the payment failed. Please cancel it manually on the payment terminal.'));
            }
        });
    },
 _iveri_void: function (ignore_error) {
        var previous_service_id = this.most_recent_service_id;
        var header = _.extend(this._iveri_common_message_header(), {
            'MessageCategory': 'Abort',
        });
        var order = this.pos.get_order();
var user = this.pos.get_cashier();
        var config = this.pos.config;
        var line = order.selected_paymentline;
      var data = {
  "Command": "Void",
         "DeviceSerialNumber":  this.payment_method.iveri_terminal_identifier,
 "MerchantReference":order.name,
 'Amount': parseInt(line.amount*100),
 "Terminal" : user.name,

           'SaleToPOIRequest': {
                'MessageHeader': header,
                'AbortRequest': {
                    'AbortReason': 'MerchantAbort',
                    'MessageReference': {
                        'MessageCategory': 'Payment',
                        'SaleID': header.SaleID,
                        'ServiceID': previous_service_id,
                    }
                },
            }        };

        return this._call_iveri(data).then(function (data) {

            // Only valid response is a 200 OK HTTP response which is
            // represented by true.
            console.log("==================data"+data);
            console.log(this)
            /*if (this && data!="undefined" &&! ignore_error && data !== true) {
                this._show_error(_('Void the payment failed. Please cancel it manually on the payment terminal.'));
            }*/
        });
    },

    _convert_receipt_info: function (output_text) {
        return output_text.reduce(function (acc, entry) {
            var params = new URLSearchParams(entry.Text);

            if (params.get('name') && !params.get('value')) {
                return acc + _.str.sprintf('<br/>%s', params.get('name'));
            } else if (params.get('name') && params.get('value')) {
                return acc + _.str.sprintf('<br/>%s: %s', params.get('name'), params.get('value'));
            }

            return acc;
        }, '');
    },

    _poll_for_response: function (resolve, reject,data) {
        var self = this;
console.log("***************data")
        if (this.was_cancelled) {
            resolve(false);
            return Promise.resolve();
        }

       /* return rpc.query({
            model: 'pos.payment.method',
            method: 'get_latest_iveri_status',
            args: [this.payment_method.id,
                   this._iveri_get_sale_id(),
                   this.payment_method.iveri_terminal_identifier,
                   this.payment_method.iveri_test_mode,
                   this.payment_method.iveri_api_key],
        }, {
            timeout: 5000,
            shadow: true,
        }).catch(function (data1) {
            reject();
            return self._handle_odoo_connection_failure(data);
        }).then(function (data1) {*/
            var notification = data;
            var last_diagnosis_service_id = data.last_received_diagnosis_id;
            var order = self.pos.get_order();
            var line = order.selected_paymentline;
console.log("=======================bhumika======data==="+JSON.stringify(status));

           /* if (self.last_diagnosis_service_id != last_diagnosis_service_id) {
                self.last_diagnosis_service_id = last_diagnosis_service_id;
                self.remaining_polls = 2;
            } else {
                self.remaining_polls--;
            }*/

       console.log("=========keys===========notifi"+ Object.keys(status));
            if (notification && notification.SaleToPOIRequest.MessageHeader.ServiceID == self.most_recent_service_id) {
        console.log("========inside===============notifcation");
                var response = notification.SaleToPOIRequest.PaymentRequest.Response;
                var additional_response = new URLSearchParams(response.AdditionalResponse);

                if (response.result.get('Code') =='0') {
                    var config = self.pos.config;
                    var payment_response = notification.SaleToPOIRequest.PaymentRequest;
                    var payment_result = payment_response.PaymentRequest;
                    var customer_receipt = payment_response.PaymentReceipt.find(function (receipt) {
                        return receipt.DocumentQualifier == 'CustomerReceipt';
                    });

                    if (customer_receipt) {
                        line.set_receipt_info(self._convert_receipt_info(customer_receipt.OutputContent.OutputText));
                    }

                    var tip_amount = payment_result.AmountsResp.TipAmount;
                    if (config.iveri_ask_customer_for_tip && tip_amount > 0) {
                        order.set_tip(tip_amount);
                        line.set_amount(payment_result.AmountsResp.AuthorizedAmount);
                    }

                    line.transaction_id = additional_response.get('pspReference');
                    line.card_type = additional_response.get('cardType');
                    resolve(true);
                } else {
                    var message = additional_response.get('message');
                    self._show_error(_.str.sprintf(_t('Message from Iveri: %s'), message));

                    // this means the transaction was cancelled by pressing the cancel button on the device
                    if (message.startsWith('108 ')) {
                        resolve(false);
                    } else {
                        line.set_payment_status('force_done');
                        reject();
                    }
                }
            } else if (self.remaining_polls <= 0) {
                self._show_error(_t('The connection to your payment terminal failed. Please check if it is still connected to the internet.'));
                self._iveri_cancel();
                resolve(false);
            }
      //  });
    },

    _iveri_handle_response: function (response) {
        console.log("+++++++++response+++++"+response);
        var line = this.pos.get_order().selected_paymentline;
 console.log("======================handle reposond==============datata respos"+JSON.stringify(response));
	 if (response.Result && response.Result.Code!="0") {
            this._show_error(_t(response.Result.Description));
            line.set_payment_status('force_done');
            return Promise.resolve();
        }
/*        if (response.error && response.error.status_code!="0") {
            this._show_error(_t(response.error.message));
            line.set_payment_status('force_done');
            return Promise.resolve();
        }
       
*/
       
        response = response;
        if (response && response.EventNotification && response.EventNotification.EventToNotify == 'Reject') {
            console.error('error from Iveri', response);

            var msg = '';
            if (response.EventNotification) {
                var params = new URLSearchParams(response.EventNotification.EventDetails);
                msg = params.get('message');
            }

            self._show_error(_.str.sprintf(_t('An unexpected error occured. Message from Iveri: %s'), msg));
            if (line) {
                line.set_payment_status('force_done');
            }

            return Promise.resolve();
        } else {
            line.set_payment_status('waitingCard');

            // This is not great, the payment screen should be
            // refactored so it calls render_paymentlines whenever a
            // paymentline changes. This way the call to
            // set_payment_status would re-render it automatically.
            this.pos.chrome.gui.current_screen.render_paymentlines();

            var self = this;
            /*var res = new Promise(function (resolve, reject) {
                // clear previous intervals just in case, otherwise
                // it'll run forever
                clearTimeout(self.polling);

                self.polling = setInterval(function () {
                    self._poll_for_response(resolve, reject,data);
                }, 5000);
            });*/

            // make sure to stop polling when we're done
console.log("##ResultResultResult"+Object.keys(response));
    if (response.ResultCode=='0') {
console.log("____________-im here");
              line.transaction_id = response.TransactionStatusInformation;
                    line.card_type = response.ApplicationLabel;
 return Promise.resolve(true);

              
}
            /*res.finally(function () {
                self._reset_state();
            });

            return res;*/
        }
    },

    _show_error: function (msg, title) {
        if (!title) {
            title =  _t('Iveri Error');
        }
        Gui.showPopup('ErrorPopup',{
            'title': title,
            'body': msg,
        });
    },
});

return PaymentIveri;
});

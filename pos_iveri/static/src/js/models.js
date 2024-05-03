odoo.define('pos_iveri.models', function (require) {
var models = require('point_of_sale.models');
var PaymentIveri = require('pos_iveri.payment');

models.register_payment_method('iveri', PaymentIveri);
models.load_fields('pos.payment.method', ['iveri_terminal_identifier', 'iveri_test_mode', 'iveri_api_key']);
});

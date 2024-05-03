odoo.define('pos_iveri_15.models', function (require) {
var models = require('point_of_sale.models');
var PaymentIveri = require('pos_iveri_15.payment');

models.register_payment_method('iveri', PaymentIveri);
models.load_fields('pos.payment.method', ['iveri_terminal_identifier', 'iveri_test_mode', 'iveri_api_key']);


models.load_fields('pos.order', ['refund_order']);


var _super_orderline = models.Orderline.prototype;
models.Orderline = models.Orderline.extend({
    initialize: function(attr, options) {
        _super_orderline.initialize.call(this,attr,options);
        this.refund_order = this.refund_order || "";
    },
      
    export_as_JSON: function(){
        var json = _super_orderline.export_as_JSON.call(this);
        var t =this.refunded_orderline_id in this.pos.toRefundLines;
        if(t)
        {
            const toRefundDetail = this.pos.toRefundLines[this.refunded_orderline_id];
            json.refund_order = toRefundDetail.orderline.orderUid;
        }
        

        return json;
    },
    init_from_JSON: function(json){
        _super_orderline.init_from_JSON.apply(this,arguments);
        this.refund_order = json.refund_order;
    },
});

});



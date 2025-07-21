import { patch } from "@web/core/utils/patch";
import { PosStore } from "@point_of_sale/app/store/pos_store";

patch(PosStore.prototype, {
    getReceiptHeaderData(order) {
        const result = super.getReceiptHeaderData(...arguments);
        if (order) {
            
            result.partner = order.get_partner();
            result.order_date = this.order_date();
            result.is_refund = this.isrefund(order);
        }
        return result;
    },

    day_of_the_month:function(d)
    { 
      var d = new Date();
      return ((d.getMonth()+1) < 10 ? '0' : '') + (d.getMonth()+1);
    },

    order_date () {
        var today = new Date();
        var date = today.getFullYear()+'-'+this.day_of_the_month()+'-'+today.getDate()+'-'+today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();;

        return date;
    },
    isrefund (order) {
        console.log("ssssssssssssssssssssss",order._isRefundOrder())
        if (order._isRefundOrder())
            return 0;
        return 1;
    },

    
});

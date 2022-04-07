odoo.define("bidfood_custom.models", function (require) {
  "use strict";

  const models = require("point_of_sale.models");
  
  var exports = {};
  models.load_fields('res.company', ['street', 'street2', 'city', 'zip']);
  models.load_fields('res.partner', ['street', 'street2', 'city', 'zip']);
  models.load_fields('pos.order', ['refunded_orders_count']);
  models.load_fields('product.template', ['branch']);
  //models.load_fields('pos.config', ['branch']);


/*var existing_models = models.PosModel.prototype.models;
var product_index = _.findIndex(existing_models, function (model) {
    return model.model === "product.product";
});
var product_model = existing_models[product_index];

models.load_models([{
  model:  product_model.model,
  fields: product_model.fields,
  order:  product_model.order,
  domain: function(self) {return [['branch', '=', self.config.company_id.branch]];},
  loaded: product_model.loaded,
}]);

models.load_fields("product.product", ["branch"]);
*/


  var _super_order = models.Order.prototype;
  models.Order = models.Order.extend({

    initialize: function(attr, options) {
        _super_order.initialize.call(this,attr,options); 
              
        this.street = this.pos.company.street || "";
        this.street2 = this.pos.company.street2 || "";
        this.city = this.pos.company.city || "";
        this.zip = this.pos.company.zip || "";
        this.is_refund = false;
        
    },

    export_for_printing: function() {
        var self = this;

        var json = _super_order.export_for_printing.apply(this,arguments);
        json.company.street = this.street;
        json.company.street2 = this.street2;
        json.company.city = this.city;
        json.company.zip = this.zip;
        /*json.client.address=this.client.address*/
        json.is_refund = this.refund_fun();
        return json;
    },

    refund_fun: function () {
        var self = this;
        return false;
    },
    
  });

  var _super_orderline = models.Orderline.prototype;
  models.Orderline = models.Orderline.extend({
      export_for_printing: function() {
          var line = _super_orderline.export_for_printing.apply(this,arguments);
          line.default_code = this.get_product().default_code;
          return line;
      },
  });

});

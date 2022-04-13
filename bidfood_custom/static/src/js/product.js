odoo.define('bidfood_custom.product', function (require) {
"use strict";

var models = require('point_of_sale.models');
var core = require('web.core');
var rpc = require('web.rpc');
var _t = core._t;

var posmodel_super = models.PosModel.prototype;
models.PosModel = models.PosModel.extend({
    load_server_data: function () {
        var self = this;

        var product_index = _.findIndex(this.models, function (model) {
            return model.model === "product.product";
        });

        var product_model = self.models[product_index];

        if (product_index !== -1) {
            this.models.splice(product_index, 1);
            this.product_model = product_model;
        }
        return posmodel_super.load_server_data.apply(this, arguments).then(function () {
          var product_fields =  typeof self.product_model.fields === 'function'  ? self.product_model.fields(self)  : self.product_model.fields;
          var product_domain =  typeof self.product_model.domain === 'function'  ? self.product_model.domain(self)  : self.product_model.domain;
            var limit_products_per_request = self.config.limit_products_per_request;
            var cur_request = 0;
            function next(resolve, reject){
                var domain = product_domain;
                if (limit_products_per_request){
                    domain = domain.slice();
                    domain.unshift('&');
                    domain.push(['branch', '=', self.config.company_id.branch],['siteid','=',self.config.name]);
                }
                return rpc.query({
                    model: 'product.product',
                    method: 'search_read',
                    domain: [["branch", "=", self.config.company_id.branch],['siteid','=',self.config.name]],
                }).then(function (products) {
                    console.log("!!!!!!!!!!",products);
                    self.db.add_products(_.map(products, function (product) {
                        product.categ = _.findWhere(self.product_categories, {'id': product.categ_id[0]});
                        product.pos = self;
                        return new models.Product({}, product);
                    }));
                });
            }
            }).then(() => {
            self.models.push(self.product_model);
        });
    },
});

});

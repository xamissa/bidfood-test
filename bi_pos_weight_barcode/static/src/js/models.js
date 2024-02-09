odoo.define('bi_pos_weight_barcode.models', function(require) {
	"use strict";

	var models = require('point_of_sale.models');
	var PosDB = require("point_of_sale.DB");

	models.load_models({
		model: 'barcode.rule',
		fields: [],
		domain: null,
		loaded: function(self, barcode_rule) { 
			self.barcode_rule = barcode_rule;    
			self.barcode_rule_by_id = {};
			self.barcode_rule_by_type = {};
			_.each(barcode_rule, function(br){
				self.barcode_rule_by_id[br.id] = br;
				self.barcode_rule_by_type[br.type] = br;
			});
		},
	});

	var OrderlineSuper = models.Orderline.prototype;
	models.Orderline = models.Orderline.extend({

		initialize: function(attr, options) {
			this.weight_barcode = this.weight_barcode || false;
			OrderlineSuper.initialize.call(this,attr,options);
		},

		set_weight_barcode: function(weight_barcode){
			this.weight_barcode = weight_barcode;
			this.trigger('change',this);
		},

		get_weight_barcode: function(){
			return this.weight_barcode;
		},

		export_as_JSON: function() {
			var json = OrderlineSuper.export_as_JSON.apply(this,arguments);
			json.weight_barcode = this.weight_barcode || false;
			return json;
		},
		
		init_from_JSON: function(json){
			OrderlineSuper.init_from_JSON.apply(this,arguments);
			this.weight_barcode = json.weight_barcode;
		},

	});


	// var posorder_super = models.Order.prototype;
	// models.Order = models.Order.extend({
	// 	initialize: function(attr, options) {
	// 		this.barcode = this.barcode || "";
	// 		this.set_barcode();
	// 		posorder_super.initialize.call(this,attr,options);
	// 	},

	// 	set_barcode: function(){
	// 		var self = this;	
	// 		var temp = Math.floor(100000000000+ Math.random() * 9000000000000)
	// 		self.barcode =  temp.toString();
	// 	},

	// 	export_as_JSON: function() {
	// 		var self = this;
	// 		var loaded = posorder_super.export_as_JSON.call(this);
	// 		loaded.barcode = self.barcode;
	// 		return loaded;
	// 	},

	// 	init_from_JSON: function(json){
	// 		posorder_super.init_from_JSON.apply(this,arguments);
	// 		this.barcode = json.barcode;
	// 	},
	// });

});
odoo.define('pos_iveri_15.refundbutton', function (require) {
    'use strict';

    const RefundButton = require('point_of_sale.RefundButton')
    const Registries = require('point_of_sale.Registries');
    const { useListener } = require('web.custom_hooks');
    var session = require('web.session');

    const RefundButtonGCC = RefundButton =>
        class extends RefundButton {

        	async willStart() {
	            var self = this;
	            session.user_has_group('point_of_sale.group_pos_manager')
	                .then(function (is_sale_manager) {	                    
	                    if (!is_sale_manager) {
	                       $('.disable').addClass("disabledbutton");
	                    }
	                });
	            return
	        }
        }
    Registries.Component.extend(RefundButton, RefundButtonGCC)
    return RefundButtonGCC
});

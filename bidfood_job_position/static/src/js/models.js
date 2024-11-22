odoo.define('erpweb_gift_card.models', function (require) {
    "use strict";

    var models = require('point_of_sale.models');
    var core = require('web.core');
    var rpc = require('web.rpc');
    var _t = core._t;
    var utils = require('web.utils');
    var session = require('web.session');

    var round_pr = utils.round_precision;
    var QWeb = core.qweb;

    models.PosModel.prototype.models.push({
        model:  'erpweb.job.position',
        fields: ['name'],
        loaded: function(self,job_position){
            self.job_position = job_position;
        },
    });
});

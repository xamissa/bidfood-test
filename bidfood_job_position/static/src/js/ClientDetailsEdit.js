odoo.define('bidfood_job_position.PosCustomerInherit', function (require) {
    "use strict";

    const models = require('point_of_sale.models');
    const Registries = require('point_of_sale.Registries');
    const ClientDetailsEdit = require('point_of_sale.ClientDetailsEdit');
    const { _t } = require('web.core');

    models.load_fields('res.partner', ['function']);

    const PosPartnerDetailsEditInherit = (ClientDetailsEdit) =>
        class extends ClientDetailsEdit {
            constructor() {
                super(...arguments);
                const partner = this.props.partner;
                this.changes.job_position = partner.function || '';
            }
            saveChanges() {
                let processedChanges = {};
                for (let [key, value] of Object.entries(this.changes)) {
                    if (this.intFields.includes(key)) {
                        processedChanges[key] = parseInt(value) || false;
                    } else {
                        processedChanges[key] = value;
                    }
                }
                if ((!this.props.partner.name && !processedChanges.name) ||
                    processedChanges.name === '' ){
                    return this.showPopup('ErrorPopup', {
                      title: _t('A Customer Name Is Required'),
                    });
                }
                if ((!this.props.partner.email && !processedChanges.email) ||
                    processedChanges.email === '' ){
                    return this.showPopup('ErrorPopup', {
                      title: _t('A Customer Email Is Required'),
                    });
                }
                if ((!this.props.partner.phone && !processedChanges.phone) ||
                    processedChanges.phone === '' ){
                    return this.showPopup('ErrorPopup', {
                      title: _t('A Customer Phone Number Is Required'),
                    });
                }
                processedChanges.function = processedChanges.job_position || '';
                delete processedChanges.job_position;
                processedChanges.id = this.props.partner.id || false;
                this.trigger('save-changes', { processedChanges });
            }
        };

    Registries.Component.extend(ClientDetailsEdit, PosPartnerDetailsEditInherit);

    return PosPartnerDetailsEditInherit;
});
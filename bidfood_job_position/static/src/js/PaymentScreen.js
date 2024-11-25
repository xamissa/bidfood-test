odoo.define('bidfood_job_position.PaymentScreen', function (require) {
    'use strict';

    const PaymentScreen = require('point_of_sale.PaymentScreen');
    const Registries = require('point_of_sale.Registries');

    const PosCustomerCheckPaymentScreen = (PaymentScreen) =>
          class extends PaymentScreen {
              async validateOrder(isForceValidate) {
               if(!this.currentOrder.get_client())
               {
                  const { confirmed } = await this.showPopup('ConfirmPopup', {
                       title: this.env._t('Please select the Customer'),
                       body: this.env._t(
                           'You need to select the customer before you can invoice or ship an order.'
                       ),
                   });
                   if (confirmed) {
                       this.selectClient();
                   }
                   return false;
               }
               await super.validateOrder(...arguments);
              }
          };

    Registries.Component.extend(PaymentScreen, PosCustomerCheckPaymentScreen);

    return PaymentScreen;
});
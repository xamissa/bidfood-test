# -- coding: utf-8 --
# Part of Odoo. See LICENSE file for full copyright and licensing details.

# from odoo.addons.hw_drivers.iot_handlers.drivers import SerialScaleDriver
from odoo.addons.hw_drivers.iot_handlers.drivers.SerialScaleDriver import AdamEquipmentDriver

import logging
_logger = logging.getLogger(__name__)

AdamEquipmentDriver._protocol=AdamEquipmentDriver._protocol._replace(baudrate=9600)

print("+++++++++++++:",AdamEquipmentDriver._protocol)
_logger.info('======>>>%s',AdamEquipmentDriver._protocol)

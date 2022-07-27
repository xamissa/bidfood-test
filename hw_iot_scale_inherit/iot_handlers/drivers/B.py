# -- coding: utf-8 --
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo.addons.hw_drivers.iot_handlers.drivers.SerialScaleDriver import AdamEquipmentDriver
from odoo.addons.hw_drivers.iot_handlers.drivers.SerialScaleDriver import ScaleProtocol
from odoo.addons.hw_drivers.iot_handlers.drivers.SerialBaseDriver import SerialDriver, SerialProtocol, serial_connection
import serial

# import logging
# _logger = logging.getLogger(__name__)

AdamEquipmentDriver._protocol=AdamEquipmentDriver._protocol._replace(baudrate=9600)


# ADAMEquipmentProtocol1 = ScaleProtocol(
#     name='Adam Equipment',
#     baudrate=9600,
#     bytesize=serial.EIGHTBITS,
#     stopbits=serial.STOPBITS_ONE,
#     parity=serial.PARITY_NONE,
#     timeout=0.2,
#     writeTimeout=0.2,
#     measureRegexp=b"\s*([0-9.]+)kg",  # LABEL format 3 + KG in the scale settings, but Label 1/2 should work
#     statusRegexp=None,
#     commandTerminator=b"\r\n",
#     commandDelay=0.2,
#     measureDelay=0.5,
#     # AZExtra beeps every time you ask for a weight that was previously returned!
#     # Adding an extra delay gives the operator a chance to remove the products
#     # before the scale starts beeping. Could not find a way to disable the beeps.
#     newMeasureDelay=5,
#     measureCommand=b'P',
#     zeroCommand=b'Z',
#     tareCommand=b'T',
#     clearCommand=None,  # No clear command -> Tare again
#     emptyAnswerValid=True,  # AZExtra does not answer unless a new non-zero weight has been detected
#     autoResetWeight=True,  # AZExtra will not return 0 after removing products
# )


# class AdamEquipmentDriver1(AdamEquipmentDriver):
#     _protocol = ADAMEquipmentProtocol1

#     def __init__(self, identifier, device):
#         super(AdamEquipmentDriver1, self).__init__(identifier, device)
#         #self.baudrate=9600
#         #self.device_type = 'fiscal_data_module'
#         #self._set_actions()
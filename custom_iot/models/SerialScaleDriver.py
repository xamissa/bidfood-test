# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.


from odoo.addons.hw_drivers.iot_handlers.drivers.SerialScaleDriver import ADAMEquipmentProtocol, ScaleDriver

ADAMEquipmentProtocol.baudrate = 9600

# class AdamEquipmentDriver(ScaleDriver):
#     _protocol = ADAMEquipmentProtocol

#     def __init__(self, identifier, device):
#         super.__init__(identifier, device)
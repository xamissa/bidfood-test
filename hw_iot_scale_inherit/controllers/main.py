# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

import io
import json
import os
import zipfile

from odoo import http
from odoo.http import request
from odoo.modules import module as modules


class IoTController(http.Controller):

    @http.route('/iot/get_handlers', type='http', auth='public', csrf=False)
    def download_iot_handlers(self, mac, auto):
        # Check mac is of one of the IoT Boxes
        box = request.env['iot.box'].sudo().search([('identifier', '=', mac)], limit=1)
        if not box or (auto == 'True' and not box.drivers_auto_update):
            return ''

        zip_list = []
        module_ids = request.env['ir.module.module'].sudo().search([('state', '=', 'installed')])
        for module in module_ids.mapped('name') + ['hw_drivers']+['hw_iot_scale_inherit']:
            filetree = modules.get_module_filetree(module, 'iot_handlers')
            if not filetree:
                continue
            for directory, files in filetree.items():
                for file in files:
                    if file.startswith('.') or file.startswith('_'):
                        continue
                    # zip it
                    zip_list.append((modules.get_resource_path(module, 'iot_handlers', directory, file), os.path.join(directory, file)))

        file_like_object = io.BytesIO()
        zipfile_ob = zipfile.ZipFile(file_like_object, 'w')
        for zip in zip_list:
            zipfile_ob.write(zip[0], zip[1]) # In order to remove the absolute path
        zipfile_ob.close()
        return file_like_object.getvalue()

# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

import datetime
from importlib import util
import io
import json
import logging
import netifaces
from OpenSSL import crypto
import os
from pathlib import Path
import subprocess
import urllib3
import zipfile
from threading import Thread
import time

from odoo import _, http
from odoo.modules.module import get_resource_path

from odoo.addons.hw_drivers.tools import helpers

def load_iot_handlers1():
    """
    This method loads local files: 'odoo/addons/hw_drivers/iot_handlers/drivers' and
    'odoo/addons/hw_drivers/iot_handlers/interfaces'
    And execute these python drivers and interfaces
    """
    for directory in ['interfaces', 'drivers']:
        path = get_resource_path('hw_drivers', 'iot_handlers', directory)
        filesList = os.listdir(path)

        path2 = get_resource_path('hw_iot_scale_inherit', 'iot_handlers', directory)
        for file in filesList:
        	if file == 'SerialScaleDriver.py':
        		path_file = os.path.join(path2, file)
            path_file = os.path.join(path, file)
            spec = util.spec_from_file_location(file, path_file)
            if spec:
                module = util.module_from_spec(spec)
                spec.loader.exec_module(module)
        
        # path2 = get_resource_path('hw_iot_scale_inherit', 'iot_handlers', directory)
        # filesList2 = os.listdir(path2)

        # for file2 in filesList2:
        #     path_file2 = os.path.join(path2, file2)
        #     spec2 = util.spec_from_file_location(file2, path_file2)
        #     if spec2:
        #         module2 = util.module_from_spec(spec2)
        #         spec2.loader.exec_module(module2)

    http.addons_manifest = {}
    http.root = http.Root()


helpers.load_iot_handlers = load_iot_handlers1

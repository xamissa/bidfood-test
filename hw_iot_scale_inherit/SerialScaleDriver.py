# -- coding: utf-8 --
# Part of Odoo. See LICENSE file for full copyright and licensing details.
from traceback import format_exc

from dbus.mainloop.glib import DBusGMainLoop

from odoo.addons.hw_drivers.tools import helpers
from odoo.addons.hw_drivers.main import Manager
from odoo.addons.hw_drivers.main import interfaces

drivers = []
iot_devices = {}

import logging
_logger = logging.getLogger(__name__)


_logger.info('======>>>MMMMMMMMMMMMM')

def run(self):
    """
    Thread that will load interfaces and drivers and contact the odoo server with the updates
    """

    #helpers.check_git_branch()
    helpers.check_certificate()

    # We first add the IoT Box to the connected DB because IoT handlers cannot be downloaded if
    # the identifier of the Box is not found in the DB. So add the Box to the DB.
    self.send_alldevices()
    helpers.download_iot_handlers()
    helpers.load_iot_handlers()

    # Start the interfaces
    for interface in interfaces.values():
        i = interface()
        i.daemon = True
        i.start()

    # Check every 3 secondes if the list of connected devices has changed and send the updated
    # list to the connected DB.
    self.previous_iot_devices = []
    while 1:
        try:
            if iot_devices != self.previous_iot_devices:
                self.send_alldevices()
                self.previous_iot_devices = iot_devices.copy()
            time.sleep(3)
        except:
            # No matter what goes wrong, the Manager loop needs to keep running
            _logger.error(format_exc())

# Must be started from main thread
#DBusGMainLoop(set_as_default=True)

Manager.run = run
#Manager.daemon = True
#Manager.start()

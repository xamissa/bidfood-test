from odoo import models, fields, api
from odoo.tools.translate import _
from odoo.exceptions import UserError,AccessError

class JobPosition(models.Model):
    _name = 'erpweb.job.position'
    _rec_name = 'name'
    _description = 'Used to Store Jon Position.'

    name = fields.Char(string="Type of Job Position")
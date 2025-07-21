from odoo import models, fields, api
from odoo.tools.translate import _
from odoo.exceptions import UserError,AccessError

class JobPosition(models.Model):
    _name = 'erpweb.job.position'
    _rec_name = 'name'
    _description = 'Used to Store Jon Position.'

    name = fields.Char(string="Type of Job Position")

class ResPartner(models.Model):
    _inherit = 'res.partner'

    job_position_id = fields.Many2one('erpweb.job.position', string = 'Job Position')


    @api.onchange('job_position_id')
    def _onchange_job_postion_id(self):
        self._origin.function = self.job_position_id.name

# -*- coding: utf-8 -*-
from odoo import models


class PosSession(models.Model):
    _inherit = 'pos.session'

    def _load_pos_data_models(self, config):
        """Add pos.receipt to the POS UI data load."""
        models = super()._load_pos_data_models(config)

        if 'pos.receipt' not in models:
            models.append('pos.receipt')

        return models
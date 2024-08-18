# Copyright (c) 2024, dhwaniris and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class mYojanaSettings(Document):
	def validate(self):
		pass
	def before_save(self):
		# Get the host_url and remove the trailing slash if present
		self.base_url = frappe.local.request.host_url.rstrip('/')


# Copyright (c) 2024, dhwaniris and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class mYojanaSettings(Document):
	def validate(self):
		doctypes = [doctype.strip() for doctype in self.doctype_which_is_shown_in_user_permission.split(',')]
		for doc in doctypes:
			if doc is not '':
				is_available = frappe.db.exists('DocType', doc)
				if not is_available:
					frappe.throw(
					msg='This Enter Doctype does not exist',
					title=doc +" Doctype doesn't exist")
			print("/////////////////////////////////", doc)
		return
		pass

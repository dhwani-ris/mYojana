# Copyright (c) 2024, suvaidyam and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from sipms.utils.login_user_details import LoginUser

class Communitymeeting(Document):
	def after_insert(self):
		if not self.single_window:
			single_window = LoginUser.get_single_windows()
			self.single_window = single_window
			frappe.db.set_value('Community meeting', self.name, 'single_window', single_window, update_modified=False)

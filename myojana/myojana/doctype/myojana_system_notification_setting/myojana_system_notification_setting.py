# Copyright (c) 2024, dhwaniris and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class mYojanaSystemNotificationSetting(Document):
	def validate(self):
		is_system_notification_enabled = frappe.db.get_single_value('mYojana Settings', 'enable_system_notification')

		if(is_system_notification_enabled != 1):
			frappe.throw("System Notification is disabled. Please enable it from mYojana Settings")

# Copyright (c) 2023, suvaidyam and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class MyojanaUser(Document):
	def validate(self):
		if(self.password != self.confirm_password):
			frappe.throw("Password and Confirm password not matched")

	def after_insert(self):
		new_user = frappe.new_doc("User")
		new_user.email = self.email
		new_user.first_name = self.first_name
		new_user.last_name = self.last_name
		new_user.role_profile_name = self.role_profile
		new_user.user_image = self.user_image
		new_user.new_password = self.confirm_password
		new_user.save()


	def on_update(self):
		user_doc = frappe.get_doc("User", self.email)
		user_doc.email = self.email
		user_doc.first_name = self.first_name
		user_doc.last_name = self.last_name
		user_doc.role_profile_name = self.role_profile
		user_doc.user_image = self.user_image
		user_doc.new_password = self.confirm_password
		user_doc.save()
		
	def on_trash(self):
		# Check if the user exists
		if frappe.db.exists("User", self.name):
			# Delete the user
			frappe.delete_doc("User", self.name, ignore_permissions=True)
			frappe.msgprint(f"The user {self.name} has been deleted.")
		else:
			frappe.msgprint(f"The user {self.name} does not exist.")
	
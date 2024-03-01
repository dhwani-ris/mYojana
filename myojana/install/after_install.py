import frappe
def update_myojana_logo():
    query =  """UPDATE tabSingles SET value = "mYojana" WHERE doctype = "Website Settings" AND field = "app_name";"""
    frappe.db.sql(query, as_dict=True)
    pass
import frappe
def update_myojana_logo():
    # update defult page /app
    query =  """UPDATE tabSingles SET value = "mYojana" WHERE doctype = "Website Settings" AND field = "app_name";"""
    update_website_logo = """UPDATE tabSingles SET value = "images/mYojana-remove.png" WHERE doctype = "Website Settings" AND field = "app_logo";"""
    frappe.db.sql(query, as_dict=True)
    frappe.db.sql(update_website_logo, as_dict=True)
    pass

def update_navbar_setting():
    pass
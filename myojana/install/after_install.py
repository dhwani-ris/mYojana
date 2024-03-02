import frappe

def update_myojana_logo():
    query =  """UPDATE tabSingles SET value = "mYojana" WHERE doctype = "Website Settings" AND field = "app_name";"""
    update_website_logo = """UPDATE tabSingles SET value = "images/mYojana-remove.png" WHERE doctype = "Website Settings" AND field = "app_logo";"""
    update_website_brand_image = """UPDATE tabSingles SET value = "images/mYojana-remove.png" WHERE doctype = "Website Settings" AND field = "banner_image";"""
    update_splash_image = """UPDATE tabSingles SET value = "/images/mYojana-remove.png" WHERE doctype = "Website Settings" AND field = "splash_image";"""
    update_favicon = """UPDATE tabSingles SET value = "/images/mYojana-remove.png" WHERE doctype = "Website Settings" AND field = "favicon";"""
    update_app_logo = """UPDATE tabSingles SET value = "/images/mYojana-remove.png" WHERE doctype = "Navbar Settings" AND field = "app_logo";"""
    
    frappe.db.sql(update_website_brand_image, as_dict=True)
    frappe.db.sql(update_app_logo, as_dict=True)
    frappe.db.sql(update_splash_image, as_dict=True)
    frappe.db.sql(query, as_dict=True)
    frappe.db.sql(update_website_logo, as_dict=True)
    frappe.db.sql(update_favicon, as_dict=True)
    pass

def update_navbar_setting():
    pass
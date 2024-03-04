import frappe
class AfterInstall:
    def set_favicons():
        update_favicon = """UPDATE tabSingles SET value = "/images/favicon.png" WHERE doctype = "Website Settings" AND field = "favicon";"""
        frappe.db.sql(update_favicon, as_dict=True)

    def set_website_logo():
        update_website_logo = """UPDATE tabSingles SET value = "images/mYojana-remove.png" WHERE doctype = "Website Settings" AND field = "app_logo";"""
        frappe.db.sql(update_website_logo, as_dict=True)

    def set_navbar_logo():
        update_app_logo = """UPDATE tabSingles SET value = "/images/favicon.png" WHERE doctype = "Navbar Settings" AND field = "app_logo";"""
        frappe.db.sql(update_app_logo, as_dict=True)

    def set_splash_image():
        update_splash_image = """UPDATE tabSingles SET value = "/images/mYojana-remove.png" WHERE doctype = "Website Settings" AND field = "splash_image";"""
        frappe.db.sql(update_splash_image, as_dict=True)

    def set_brand_logo():
        update_website_brand_image = """UPDATE tabSingles SET value = "/images/favicon.png" WHERE doctype = "Website Settings" AND field = "banner_image";"""
        frappe.db.sql(update_website_brand_image, as_dict=True)

    def set_app_name():
        set_app_name =  """UPDATE tabSingles SET value = "mYojana" WHERE doctype = "Website Settings" AND field = "app_name";"""
        frappe.db.sql(set_app_name, as_dict=True)

    def set_navbar_setting():
        update_home_page = """UPDATE tabSingles SET value = "/app" WHERE doctype = "Website Settings" AND field = "home_page";"""
        frappe.db.sql(update_home_page, as_dict=True)

import frappe

class  Cache:
    def get_csc(user = None):
        if not user:
            user = frappe.session.user
        value = frappe.cache().get_value("csc-"+user)
        if value is None:
            usr = frappe.get_doc("User", user)
            frappe.cache().set_value('csc-'+user, usr.csc)
        return frappe.cache().get_value("csc-"+user)
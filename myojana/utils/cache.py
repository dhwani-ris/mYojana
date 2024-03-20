import frappe

class  Cache:

    def get_csc(user = None):
        
        if not user:
            user = frappe.session.user
        value = frappe.cache().get_value("filter-"+user)
        if value is None:
            if(("Administrator" not in frappe.get_roles(user))):
                usr = frappe.get_doc("Myojana User", user)
            if "Admin" in frappe.get_roles(user) and ("Administrator" not in frappe.get_roles(user)):
                frappe.cache().set_value('filter-'+user, usr.state)
            elif "CSC Member" in frappe.get_roles(user) and ("Administrator" not in frappe.get_roles(user)):
                frappe.cache().set_value('filter-'+user, usr.centre)
            elif "Help-desk member" in frappe.get_roles(user) and ("Administrator" not in frappe.get_roles(user)):
                frappe.cache().set_value('filter-'+user, usr.centre)
            elif "MIS executive" in frappe.get_roles(user) and ("Administrator" not in frappe.get_roles(user)):
                frappe.cache().set_value('filter-'+user, usr.centre)
            else:
                return None
        return frappe.cache().get_value("filter-"+user)
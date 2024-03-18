import frappe

class  Cache:
    def get_csc(user = None):
        if not user:
            user = frappe.session.user
        # value = frappe.cache().get_value("filter-"+user)
        value = None
        if value is None:
            if(("Administrator" not in frappe.get_roles(user))):
                    role_list = frappe.db.get_list('Role Permission')
                    usr = frappe.get_doc("Myojana User", user)
                    for permission in role_list:
                        if permission.name in frappe.get_roles(user) and ("Administrator" not in frappe.get_roles(user)):
                            filter_key = frappe.db.get_value('Role Permission', permission.name, 'filter_key')
                            filter_value = getattr(usr, filter_key)
                            frappe.cache().set_value('filter-'+user, filter_value)
                        else:
                            pass
        return frappe.cache().get_value("filter-"+user)
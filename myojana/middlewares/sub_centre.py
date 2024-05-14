import frappe
def list_query(user):
    if not user:
        user = frappe.session.user
        
    if "Admin" in frappe.get_roles(user) and ("Administrator" not in frappe.get_roles(user)):
        # return """(`tabSub Centre`.centre != '{0}')""".format('Admin')
        return None
    elif("Administrator" not in frappe.get_roles(user)):
        pass
        # return "(`tabSub Centre`.centre = '{0}')".format(centres)
    return None

import frappe
from myojana.utils.login_user_details import LoginUser
def list_query(user):
    if not user:
        user = frappe.session.user
        
    if "Admin" in frappe.get_roles(user) and ("Administrator" not in frappe.get_roles(user)):
        # return """(`tabHelp Desk`.centre != '{0}')""".format('Admin')
        return None
    elif("Administrator" not in frappe.get_roles(user)):
        centres = LoginUser.get_centres()
        return "(`tabHelp Desk`.centre = '{0}')".format(centres)
    return None

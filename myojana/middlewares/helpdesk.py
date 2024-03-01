import frappe
from sipms.utils.login_user_details import LoginUser
def list_query(user):
    if not user:
        user = frappe.session.user
        
    if "Admin" in frappe.get_roles(user) and ("Administrator" not in frappe.get_roles(user)):
        # return """(`tabHelp Desk`.single_window != '{0}')""".format('Admin')
        return None
    elif("Administrator" not in frappe.get_roles(user)):
        single_windows = LoginUser.get_single_windows()
        return "(`tabHelp Desk`.single_window = '{0}')".format(single_windows)
    return None

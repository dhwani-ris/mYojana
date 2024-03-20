import frappe
from myojana.utils.login_user_details import LoginUser
def list_query(user):
    if not user:
        user = frappe.session.user
    
    if"Administrator" not in frappe.get_roles(user):
        state = LoginUser.get_state()

        
    if"Administrator" in frappe.get_roles(user):
        return ''
    elif "Admin" in frappe.get_roles(user) and "Administrator" not in frappe.get_roles(user):
        include_roles = ['CSC Member', 'MIS executive', 'Help-desk member']
        profile_condition = f"""(`tabMyojana User`.name = '{user}' OR `tabMyojana User`.role_profile IN ({', '.join(f"'{r}'" for r in include_roles)}) And `tabMyojana User`.state = '{state}')"""
        return profile_condition
    elif("MIS executive" in frappe.get_roles(user) and "Administrator" not in frappe.get_roles(user)):
        include_roles = ['CSC Member', 'Help-desk member']
        profile_condition = f"""(`tabMyojana User`.name = '{user}' OR `tabMyojana User`.role_profile IN ({', '.join(f"'{r}'" for r in include_roles)}) And `tabMyojana User`.state = '{state}')"""
        return profile_condition
    else:
        return ""

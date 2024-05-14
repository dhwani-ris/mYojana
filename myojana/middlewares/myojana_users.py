import frappe
def list_query(user):
    if not user:
        user = frappe.session.user
    
    # if"Administrator" not in frappe.get_roles(user):

        
    if"Administrator" in frappe.get_roles(user):
        return ''
    # elif "Admin" in frappe.get_roles(user) and "Administrator" not in frappe.get_roles(user):
    #     include_roles = ['CSC Member', 'MIS executive', 'Sub-Centre']
    #     profile_condition = f"""(`tabMyojana User`.name = '{user}' OR `tabMyojana User`.role_profile IN ({', '.join(f"'{r}'" for r in include_roles)}) And `tabMyojana User`.state = '{state}')"""
    #     return profile_condition
    # elif("MIS executive" in frappe.get_roles(user) and "Administrator" not in frappe.get_roles(user)):
    #     include_roles = ['CSC Member', 'Sub-Centre']
    #     profile_condition = f"""(`tabMyojana User`.name = '{user}' OR `tabMyojana User`.role_profile IN ({', '.join(f"'{r}'" for r in include_roles)}) And `tabMyojana User`.state = '{state}')"""
    #     return profile_condition
    else:
        return ""

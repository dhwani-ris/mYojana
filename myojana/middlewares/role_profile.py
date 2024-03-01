import frappe
# from epms.utils.cache import Cache
def list_query(user):
    if not user:
        user = frappe.session.user
        
    if "Admin" in frappe.get_roles(user) and ("Administrator" not in frappe.get_roles(user)):
        return """(`tabRole Profile`.role_profile != '{0}')""".format('Admin')
    elif "MIS executive" in frappe.get_roles(user) and ("Administrator" not in frappe.get_roles(user)):
        excluded_roles = ['Admin', 'MIS executive']
        return """(`tabRole Profile`.role_profile NOT IN ({0}))""".format(', '.join(f"'{r}'" for r in excluded_roles))
    return ""

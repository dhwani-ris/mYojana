import frappe
def list_query(user):
    if not user:
        user = frappe.session.user
    if "Administrator" not in frappe.get_roles(user):
        profile_condition = f"""(`tabUser`.name = '{user}')"""
        return profile_condition


import frappe
from myojana.utils.cache import Cache
from myojana.utils.filter import Filter
def list_query(user):
    if not user:
        user = frappe.session.user
        
    value = Cache.get_csc()
    if("Administrator" not in frappe.get_roles(user)):
        value = Filter.set_query_filters()
        return """(`tabPrimary Member`.{})""".format(value)
        return """(`tabPrimary Member`.state = '{0}')""".format(value)
    # elif "CSC Member" in frappe.get_roles(user) and ("Administrator" not in frappe.get_roles(user)):
    #     return """(`tabPrimary Member`.single_window = '{0}')""".format(value)
    # elif "Help-desk member" in frappe.get_roles(user) and ("Administrator" not in frappe.get_roles(user)):
    #     return """(`tabPrimary Member`.single_window = '{0}')""".format(value)
    # elif "MIS executive" in frappe.get_roles(user) and ("Administrator" not in frappe.get_roles(user)):
    #     return """(`tabPrimary Member`.single_window = '{0}')""".format(value)
    else:
        return ""

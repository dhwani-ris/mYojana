import frappe
from myojana.utils.cache import Cache

class Filter:
    def set_query_filters(list=False):
        roles = frappe.get_roles(frappe.session.user)
        if "Administrator" not in roles:
            cond_str = ""
            role_list = frappe.db.get_list('Role Permission')
            for permission in role_list:
                if permission.name in frappe.get_roles(frappe.session.user):
                    cond_str = frappe.db.get_value('Role Permission', permission.name, 'filter_key')
            value = Cache.get_csc()
            if list is False:
                return f"{cond_str} = '{value}'"
            else:
                return [cond_str, value]
        return ""

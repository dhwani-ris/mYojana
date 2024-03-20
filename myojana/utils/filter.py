import frappe
from myojana.utils.cache import Cache


class Filter:
    def set_query_filters(list=False):
        roles = frappe.get_roles(frappe.session.user)
        if("Administrator" not in roles):
            cond_str = ""
            if "Admin" in roles:
                cond_str = "state"
            elif "MIS executive" in roles:
                cond_str = "centre"
            elif "CSC Member" in roles:
                cond_str = "centre"
            elif "Help-desk member" in roles:
                cond_str = "centre"
            value = Cache.get_csc()
            if list:
                return [cond_str , value]
            return f"""{cond_str} = '{value}'"""
        return ""


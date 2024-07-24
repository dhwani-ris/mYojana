import frappe

@frappe.whitelist()
def get_dashboards_list():
    return frappe.get_all('SVA Dashboard', fields=['name', 'title'],order_by='creation')

@frappe.whitelist()
def get_dashboard_filter(name=None):
    if name is not None:
        return frappe.get_all('Report Filter', filters={'parent': name,'parenttype':'SVA Dashboard'}, fields=['name','fieldname','fieldtype','label','mandatory','options','wildcard_filter','default'])
    else:
        return []

@frappe.whitelist()
def get_dashboard_number_cards(name=None):
    if name is not None:
        return frappe.get_all('SVA Dashboard Card Child', filters={'parent': name,'parenttype':'SVA Dashboard'}, fields=['card'])
    else:
        return []
import frappe

@frappe.whitelist()
def get_dashboards_list():
    return frappe.get_all('SVA Dashboard', fields=['name', 'title'],order_by='creation',ignore_permissions=True)

@frappe.whitelist()
def get_dashboard_filter(name=None):
    if name is not None:
        return frappe.get_all('SVA Dashboard Filter Child', filters={'parent': name,'parenttype':'SVA Dashboard'}, fields=['name','label','fieldtype','fieldname','options','only_select','dependent','depends_on','valuefield','title_field'],order_by='idx',ignore_permissions=True)
    else:
        return []

@frappe.whitelist()
def get_dashboard_number_cards(name=None):
    if name is not None:
        return frappe.get_all('SVA Dashboard Card Child', filters={'parent': name,'parenttype':'SVA Dashboard'}, fields=['card','background','border','text','number','is_section','label'],order_by='idx',ignore_permissions=True)
    else:
        return []
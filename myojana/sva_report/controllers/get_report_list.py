import frappe

@frappe.whitelist()
def get_report_list():
    return frappe.get_list('SVA Report')

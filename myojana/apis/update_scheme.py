import frappe
import json

@frappe.whitelist()
def toggle_enable_disable(list,value):
    list = json.loads(list)
    for item in list:
        frappe.db.set_value('Scheme', item, 'enabled', value, update_modified=False)
    frappe.db.commit()
    return len(list)

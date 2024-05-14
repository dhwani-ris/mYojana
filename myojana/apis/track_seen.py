import frappe
import json

@frappe.whitelist()
def toggle_track_changes(list,value):
    list = json.loads(list)
    for item in list:
        frappe.db.set_value('DocType', item, 'track_changes', value, update_modified=False)
    frappe.db.commit()
    return len(list)
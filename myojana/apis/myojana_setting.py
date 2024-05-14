import frappe
import json

@frappe.whitelist()
def get_myojana_setting(fields=['*']):
    try:
        myojana_setting = frappe.get_doc('mYojana Settings')
        if fields == '*':
            return myojana_setting.as_dict()
        result = {field: myojana_setting.get(field) for field in json.loads(fields)}
        return result
    except frappe.DoesNotExistError:
        frappe.log_error('mYojana Settings document does not exist', 'get_myojana_setting')
        return None
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), 'get_myojana_setting')
        return None


import frappe
from frappe import _

@frappe.whitelist(allow_guest=True)
def get_field_lists(doctype_name, field_types):
    # Your API logic here
    meta = frappe.get_meta(doctype_name)
    filtered_fields = [{"label": field.label, "value": field.fieldname, "type": field.fieldtype , "options":field.options} for field in meta.fields if field.fieldtype in field_types]
    return filtered_fields
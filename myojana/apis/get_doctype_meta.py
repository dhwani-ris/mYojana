import frappe

@frappe.whitelist()
def get_allowed_doctype(doctype_name="Beneficiary Profiling", field_types='Link', options=None):
    meta = frappe.get_meta(doctype_name)
    
    if options is not None:
        filtered_fields = [{
            "label": field.label,
            "value": field.fieldname,
            "type": field.fieldtype,
            "options": field.options
        } for field in meta.fields if field.fieldtype in field_types and field.options == options]
    else:
        filtered_fields = [{
            "label": field.label,
            "value": field.fieldname,
            "type": field.fieldtype,
            "options": field.options
        } for field in meta.fields if field.fieldtype in field_types]

    return filtered_fields

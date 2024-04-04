import frappe

@frappe.whitelist()
def get_allowed_doctype(doctype_name = "Beneficiary Profiling" , field_types= 'Link', options="State"):
    meta = frappe.get_meta(doctype_name)
    filtered_fields = [{
        "label": field.label,
        "value": field.fieldname,
        "type": field.fieldtype ,
        "options":field.options
        } for field in meta.fields if field.fieldtype in field_types if field.options in options]
    return filtered_fields

# apps/.py
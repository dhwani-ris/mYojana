import frappe

@frappe.whitelist()
def get_allowed_doctype():
    doctype = frappe.db.get_single_value('mYojana Settings', 'doctype_which_is_shown_in_user_permission')
    doctypes = [doctype.strip() for doctype in doctype.split(',')]
    return doctypes
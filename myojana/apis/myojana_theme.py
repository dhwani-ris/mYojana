import frappe
from frappe import _

@frappe.whitelist()
def get_theme(theme):
    try:
        myojna_theme_options = frappe.db.exists("Property Setter", 'User-desk_theme-options')
        if not myojna_theme_options:
            try:
                new_doc = frappe.get_doc({
                    "doctype": "Property Setter",
                    "doctype_or_field": "DocField",
                    "field_name":"desk_theme",
                    "property": "options",
                    "doc_type": "User",
                    "value": "Light\nDark\nAutomatic\nMyojana"
                })
                new_doc.insert(ignore_permissions=True)
            except frappe.DuplicateEntryError:
                frappe.log_error(frappe.get_traceback(), _("Duplicate entry error in get_theme"))

        user = frappe.get_doc("User", frappe.session.user)
        user.set("desk_theme", theme)
        user.save()
        frappe.clear_cache(user.name)
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), _("Error in get_theme"))
        frappe.throw(_("An error occurred while fetching the theme. Please try again later."))
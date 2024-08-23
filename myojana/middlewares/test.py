import frappe


def test(doc, method):
    frappe.msgprint("Hello from test middleware")
    frappe.msgprint(f"Method: {method}")

import frappe
import imgkit
import base64
from frappe.utils.jinja import render_template

@frappe.whitelist(allow_guest=True)
def create_image(doc_id, whatsapp_temp_id, base64Encode=False):
    html = frappe.get_doc("Whats App Template", whatsapp_temp_id)
    doc = frappe.get_doc(html.variable_reference_doctype, doc_id)
    context = doc.as_dict()
    processed_html = render_template(html.html, context)
    # Convert HTML to image with fixed size
    options = {
        'width': 547,
        'height': 373,
    }
    image_binary = imgkit.from_string(processed_html, False, options=options)
    if base64Encode:
        return base64.b64encode(image_binary).decode('utf-8')
    else:
        return image_binary
    
@frappe.whitelist(allow_guest=True)
def preview_image(doctype, doc, template):
    doc = frappe.get_doc(doctype, doc)
    context = doc.as_dict()
    try:
        processed_html = render_template(template, context)
    except Exception as e:
        frappe.log_error(f"Error in rendering template: {e}", "Check Syntax")
        return None
    # processed_html = render_template(template, context)
    # Convert HTML to image with fixed size
    options = {
        'width': 547,
        'height': 373,
    }
    image_binary = imgkit.from_string(processed_html, False, options=options)
    return base64.b64encode(image_binary).decode('utf-8')
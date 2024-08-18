import frappe
import imgkit
import base64
from frappe.utils.jinja import render_template
from frappe.utils.file_manager import save_file
import json

@frappe.whitelist(allow_guest=True)
def create_image(ref_doc, tepmlate_name, base64Encode=False):
    tepmlate = frappe.get_doc("App Template", tepmlate_name)
    doc = frappe.get_doc(tepmlate.ref_doctype, ref_doc)
    context = doc.as_dict()
    processed_html = render_template(tepmlate.html, context)
    # Convert HTML to image with fixed size
    options = {
        'width': 547,
        'height': 373,
    }
    try:
        options = json.loads(tepmlate.options)
    except:
        pass

    image_binary = imgkit.from_string(processed_html, False, options=options)
    if base64Encode:
        return base64.b64encode(image_binary).decode('utf-8')
    else:
        file = save_file(f"{doc.name}.png", image_binary, tepmlate.ref_doctype, doc.name, folder=None, decode=False, is_private=0, df=None)
        return file,doc
    
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


@frappe.whitelist(allow_guest=True)
def preview_doc_template(doc):
    template_name = frappe.db.get_single_value('mYojana Settings', 'id_card_template')
    if not template_name:
        frappe.throw(_("Please set ID Card Template in mYojana Settings"))
    print("template_name",template_name)
    template = frappe.get_doc('App Template', template_name)
    if not template:
        frappe.throw(_("Please set ID Card Template in Whats App Template"))

    return preview_image(template.ref_doctype, doc, template.html)
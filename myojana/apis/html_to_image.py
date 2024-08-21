import frappe
import imgkit
import base64
from frappe.utils.jinja import render_template
from frappe.utils.file_manager import save_file,get_file
from frappe import _
import os
import json
from frappe.utils import get_site_path


static_img = f"""data:image/jpeg;base64,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"""

def get_attachment_fields(doctype_name, doc):
    meta = frappe.get_meta(doctype_name)
    attachment_fields = []
    for field in meta.fields:
        field_value = doc.get(field.fieldname)
        if field_value:
            if field.fieldtype in ['Attach', 'Attach Image']:
                attachment_fields.append(field.fieldname)
    
    return attachment_fields

def file_to_base64(file_path):
    with open(file_path, "rb") as file:
        return base64.b64encode(file.read()).decode('utf-8')

@frappe.whitelist(allow_guest=True)
def create_image(ref_doc, tepmlate_name):
    template = frappe.get_doc("App Template", tepmlate_name)
    context,doc = set_context_data(template.ref_doctype,ref_doc)
    try:
        options = json.loads(options)
    except:
        options = None    
    if not options:
        options = {
            'width': 547,
            'height': 373,
        }

    try:
        processed_html = render_template(template.html, context)
        image_binary = imgkit.from_string(processed_html, False, options=options)
        file = save_file(f"{doc.name}.png", image_binary, template.ref_doctype, doc.name, folder=None, decode=False, is_private=0, df=None)
        return file,doc
    except Exception as e:
        print("Exception::",e)
        frappe.log_error(f"Error in rendering template: {e}", "Check Syntax")
        return None,None
    
def sanitize_file_path(original_file_path):
    # if we are in a private file system, we need to remove the private files path
    if original_file_path.startswith('/files/'):
        return original_file_path.replace('/files/', '/public/files/')
    return original_file_path
def set_context_data(doctype, name):
    doc = frappe.get_doc(doctype, name)
    attachment_fields = get_attachment_fields(doctype , doc)
    for field in attachment_fields:
            file_url = doc.get(field)
            if file_url:
                file_path = frappe.get_site_path(sanitize_file_path(file_url).lstrip('/'))
                if os.path.isfile(file_path):
                    base64_data =  f"data:image/png;base64,{file_to_base64(file_path)}"
                    doc.set(field, base64_data)
    return doc.as_dict(),doc
@frappe.whitelist(allow_guest=True)
def preview_image(doctype, doc, template, options=None):
    context, doc = set_context_data(doctype,doc)
    # return template, context
    try:
        processed_html = render_template(template, context)
    except Exception as e:
        print("Exception::",e)
        frappe.log_error(f"Error in rendering template: {e}", "Check Syntax")
        return None
    
    try:
        options = json.loads(options)
    except:
        options = None    
    if not options:
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
import frappe
import imgkit
import base64
from frappe.utils.jinja import render_template
from frappe.utils.file_manager import save_file,get_file
from frappe import _
import os
import json
from frappe.utils import get_site_path

def get_attachment_fields(doctype_name):
    meta = frappe.get_meta(doctype_name)
    attachment_fields = []

    for field in meta.fields:
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
    attachment_fields = get_attachment_fields(doctype)
    for field in attachment_fields:
            file_url = doc.get(field)
            file_path = frappe.get_site_path(sanitize_file_path(file_url).lstrip('/'))
            if file_url:
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
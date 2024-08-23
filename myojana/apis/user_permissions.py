import frappe
import json

@frappe.whitelist()
def create_user_permissions(doc=None):
    document = json.loads(doc)
    allow = document.get('allow')
    for_value = document.get('for_value')
    doctype = document.get('doctype')
    user = document.get('user')
    if allow == "State":
        exist  = frappe.db.exists(document)
        if not exist:
            state_perm = frappe.get_doc(document)
            state_perm.insert(ignore_permissions=True)
    elif allow == "District":
        state_value = frappe.db.get_value("District", for_value, ['state'])
        new_state_doc = {
                'doctype': doctype,
                'allow': 'State',
                'for_value':state_value,
                'user':user
            }
        state_exist  = frappe.db.exists(new_state_doc)
        dist_exist  = frappe.db.exists(document)
        if not state_exist:
            state_perm = frappe.get_doc(new_state_doc)
            state_perm.insert(ignore_permissions=True)
        if not dist_exist:
            dist_perm = frappe.get_doc(document)
            dist_perm.insert(ignore_permissions=True)
    elif allow == "Block":
        state_value,dist_value = frappe.db.get_value("Block", for_value, ['state','district'])
        new_state_doc = {
                'doctype': doctype,
                'allow': 'State',
                'for_value':state_value,
                'user':user
            }
        new_dist_doc = {
                'doctype': doctype,
                'allow': 'District',
                'for_value':dist_value,
                'user':user
            }
        state_exist  = frappe.db.exists(new_state_doc)
        dist_exist  = frappe.db.exists(new_dist_doc)
        block_exist  = frappe.db.exists(document)
        if not state_exist:
            state_perm = frappe.get_doc(new_state_doc)
            state_perm.insert(ignore_permissions=True)
        if not dist_exist:
            dist_perm = frappe.get_doc(new_dist_doc)
            dist_perm.insert(ignore_permissions=True)
        if not block_exist:
            block_perm = frappe.get_doc(document)
            block_perm.insert(ignore_permissions=True)
    elif allow == "Village":
        state_value,dist_value , block_val= frappe.db.get_value("Village", for_value, ['state','district', 'block'])
        new_state_doc = {
                'doctype': doctype,
                'allow': 'State',
                'for_value':state_value,
                'user':user
            }
        new_dist_doc = {
                'doctype': doctype,
                'allow': 'District',
                'for_value':dist_value,
                'user':user
            }
        new_block_doc = {
                'doctype': doctype,
                'allow': 'Block',
                'for_value':block_val,
                'user':user
            }
        state_exist  = frappe.db.exists(new_state_doc)
        dist_exist  = frappe.db.exists(new_dist_doc)
        block_exist  = frappe.db.exists(new_block_doc)
        village_exist  = frappe.db.exists(document)
        if not state_exist:
            state_perm = frappe.get_doc(new_state_doc)
            state_perm.insert(ignore_permissions=True)
        if not dist_exist:
            dist_perm = frappe.get_doc(new_dist_doc)
            dist_perm.insert(ignore_permissions=True)
        if not block_exist:
            block_perm = frappe.get_doc(new_block_doc)
            block_perm.insert(ignore_permissions=True)
        if not village_exist:
            vill_perm = frappe.get_doc(document)
            vill_perm.insert(ignore_permissions=True)

    elif allow == "Centre":
        state_value = frappe.db.get_value("Centre", for_value, ['state'])
        new_state_doc = {
                'doctype': doctype,
                'allow': 'State',
                'for_value':state_value,
                'user':user
            }
        state_exist  = frappe.db.exists(new_state_doc)
        block_exist  = frappe.db.exists(document)
        if not state_exist:
            state_perm = frappe.get_doc(new_state_doc)
            state_perm.insert(ignore_permissions=True)
        if not block_exist:
            block_perm = frappe.get_doc(document)
            block_perm.insert(ignore_permissions=True)
    elif allow == "Sub Centre":
        state_value,centre_value = frappe.db.get_value("Sub Centre", for_value, ['state','centre'])
        new_state_doc = {
                'doctype': doctype,
                'allow': 'State',
                'for_value':state_value,
                'user':user
            }
        new_centre_doc = {
                'doctype': doctype,
                'allow': 'Centre',
                'for_value':centre_value,
                'user':user
            }
        state_exist  = frappe.db.exists(new_state_doc)
        centre_exist  = frappe.db.exists(new_centre_doc)
        sub_centre_exist  = frappe.db.exists(document)
        if not state_exist:
            state_perm = frappe.get_doc(new_state_doc)
            state_perm.insert(ignore_permissions=True)
        if not centre_exist:
            dist_perm = frappe.get_doc(new_centre_doc)
            dist_perm.insert(ignore_permissions=True)
        if not sub_centre_exist:
            sub_centre_perm = frappe.get_doc(document)
            sub_centre_perm.insert(ignore_permissions=True)
    else:
        return document
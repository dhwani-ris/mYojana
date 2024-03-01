import frappe
from myojana.utils.login_user_details import LoginUser

class family:
    def create(beneficiary):
        print("family[create]")
        family_doc = frappe.new_doc("Primary Member")
        family_doc.name_of_head_of_family = beneficiary.name
        family_doc.name_of_parents = beneficiary.name_of_the_beneficiary
        family_doc.phone_no = beneficiary.contact_number
        family_doc.state = beneficiary.state
        family_doc.single_window = beneficiary.single_window
        family_doc.help_desk = beneficiary.help_desk
        family_doc.save()
        return family_doc


    def update(beneficiary):
        family_doc_name = frappe.db.exists('Primary Member', beneficiary.contact_number)
        family_doc = None
        if(family_doc_name):
            family_doc = frappe.get_doc("Primary Member", family_doc_name)
            family_doc.name_of_parents = beneficiary.name
            family_doc.phone_no = beneficiary.contact_number
            family_doc.state = beneficiary.state
            family_doc.single_window = beneficiary.single_window
            family_doc.help_desk = beneficiary.help_desk
            family_doc.save()
        else:
            family_doc = frappe.new_doc("Primary Member")
            family_doc.name_of_head_of_family = beneficiary.name
            family_doc.name_of_parents = beneficiary.name_of_the_beneficiary
            family_doc.phone_no = beneficiary.contact_number
            family_doc.single_window = beneficiary.single_window
            family_doc.help_desk = beneficiary.help_desk
            family_doc.state = beneficiary.state
            family_doc.insert()
            family.handle_contactnumber_change(beneficiary,family_doc)
            frappe.msgprint("The beneficiary has been updated to a primary member")
        return family_doc

    def handle_contactnumber_change(doc,family_doc):
        _doc_before_save = doc.get('_doc_before_save',None)
        # print("_doc_before_save",_doc_before_save)
        if _doc_before_save:
            # print("_doc_before_save[IF]")
            if doc.get('contact_number') != _doc_before_save.get('contact_number'):
                # print("_doc_before_save[IF->IF]")
                families = frappe.db.get_list(doctype='Primary Member', filters={'name':_doc_before_save.contact_number}, fields=["name"])
                family = families[0] if len(families) else None
                # print("family",family)
                if family:
                    # print("_doc_before_save[IF->IF->IF]")
                    query = f"UPDATE `tabBeneficiary Profiling` SET select_primary_member = '{family_doc.name}' WHERE select_primary_member = '{_doc_before_save.select_primary_member}'"
                    up_doc = frappe.db.sql(query)
                    # print("_doc_before_save[IF->IF->IF] up_doc",up_doc,query)
                    del_doc = frappe.db.delete("Primary Member", {"name": _doc_before_save.select_primary_member})
                    # print("_doc_before_save[IF->IF->IF] del_doc",del_doc)

    def delete_family(beneficiary):
        delate_family = frappe.db.delete("Primary Member", {
                        "name": beneficiary.contact_number})
        return delate_family
import frappe
import ast

class  Cache:

    def get_csc(user = None):
        Cache.get_user_permission()
        if not user:
            user = frappe.session.user
        value = frappe.cache().get_value("filter-"+user)
        if value is None:
            if(("Administrator" not in frappe.get_roles(user))):
                usr = frappe.get_doc("Myojana User", user)
            if "Admin" in frappe.get_roles(user) and ("Administrator" not in frappe.get_roles(user)):
                frappe.cache().set_value('filter-'+user, usr.state)
            elif "CSC Member" in frappe.get_roles(user) and ("Administrator" not in frappe.get_roles(user)):
                frappe.cache().set_value('filter-'+user, usr.centre)
            elif "Sub-Centre" in frappe.get_roles(user) and ("Administrator" not in frappe.get_roles(user)):
                frappe.cache().set_value('filter-'+user, usr.centre)
            elif "MIS executive" in frappe.get_roles(user) and ("Administrator" not in frappe.get_roles(user)):
                frappe.cache().set_value('filter-'+user, usr.centre)
            else:
                return None
        return frappe.cache().get_value("filter-"+user)

    def get_user_permission():
        usr = frappe.session.user
        myojana_setting_child = frappe.db.sql("""
                SELECT
                    doctypes , field_name
                FROM `tabSetting Doctype Child`
            """,as_dict=0)
        list = frappe.db.get_list('User Permission',
            filters={
                'user': usr
            },
            fields=['allow', 'for_value'],
            as_list=True,
        )
        grouped_data = {}
        for allow, for_value in list:
            if allow in grouped_data:
                grouped_data[allow].append(for_value)
            else:
                grouped_data[allow] = [for_value]
        output = [{key:  ast.literal_eval('(' + ','.join([f"'{v}'" for v in value]) + ')')} for key, value in grouped_data.items()]
        print("///////////////////////////child", myojana_setting_child)
        print("chas////////////////////////////",usr, output)
        # maping of table keys and values from user permissions 
        for i,a in enumerate(myojana_setting_child):
            print("aaaaaaaaaaaa",i , a)
            for b in output:
            # if(a):
                print("bbbbbbbbbbb",b)
            
        # if()
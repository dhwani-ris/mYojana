import frappe
import ast

class  Cache:
    def get_user_permission(cond_str=True):
        usr = frappe.session.user
        # getting myojan setting and mapping of state and district
        myojana_setting_child = frappe.db.sql("""
                SELECT
                    doctypes , field_name
                FROM `tabSetting Doctype Child`
            """,as_dict=0)
        # getting the list of user permission list 
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
        per_obj = [{key:  ast.literal_eval('(' + ','.join([f"'{v}'" for v in value]) + ')')} for key, value in grouped_data.items()]
        # maping of table keys and values from user permissions 
        if(cond_str):
            cond_str = ""
            for i, a in enumerate(myojana_setting_child):
                for b in per_obj:
                    if a[0] in b:
                        if cond_str:  # Add 'AND' if cond_str is not empty
                            cond_str += " OR "
                        cond_str += f"{a[1]} IN {b[a[0]]}"
                    else:
                        print(f"Key '{a[0]}' not found in dictionary.")
            return cond_str            
        else:
            return per_obj
import frappe

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
        list = frappe.db.get_list('User Permission',
            filters={
                'user': usr
            },
            fields=['allow', 'for_value'],
            as_list=True,
        )
        grouped_data = {}
        for key, value in list:
            if key in grouped_data:
                grouped_data[key].append(value)
            else:
                grouped_data[key] = [value]
        # data = frappe.db.get_list('User Permission', pluck='for_value')
            #  select * from ben where state in ("", "")

        print("chas////////////////////////////",usr, grouped_data)
import frappe

class  LoginUser:
    def get_centres():
        usr = frappe.get_doc("Myojana User", frappe.session.user)
        centre = usr.centre
        return centre

    # def get_sub_centre():
    #     usr = frappe.get_doc("Myojana User", frappe.session.user)
    #     sub_centre = usr.sub_centre
    #     return sub_centre
    
    def get_state():
        usr = frappe.get_doc("Myojana User", frappe.session.user)
        state = usr.state
        return state
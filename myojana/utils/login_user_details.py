import frappe

class  LoginUser:
    def get_centres():
        usr = frappe.get_doc("Myojana User", frappe.session.user)
        centre = usr.centre
        return centre

    # def get_helpdesk():
    #     usr = frappe.get_doc("Myojana User", frappe.session.user)
    #     help_desk = usr.help_desk
    #     return help_desk
    
    def get_state():
        usr = frappe.get_doc("Myojana User", frappe.session.user)
        state = usr.state
        return state
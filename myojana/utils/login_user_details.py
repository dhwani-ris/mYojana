import frappe

class  LoginUser:
    def get_single_windows():
        usr = frappe.get_doc("Sipms User", frappe.session.user)
        single_window = usr.single_window
        return single_window

    # def get_helpdesk():
    #     usr = frappe.get_doc("Sipms User", frappe.session.user)
    #     help_desk = usr.help_desk
    #     return help_desk
    
    def get_state():
        usr = frappe.get_doc("Sipms User", frappe.session.user)
        state = usr.state
        return state
// Copyright (c) 2024, suvaidyam and contributors
// For license information, please see license.txt

frappe.ui.form.on("Name of the Department", {
	refresh(frm) {
        if(frm.doc.department_urlwebsite){
            frm.add_web_link(frm?.doc?.department_urlwebsite)
        }
	},
    department_urlwebsite: function(frm){
        if(frm.doc.department_urlwebsite){
            frm.add_web_link(frm?.doc?.department_urlwebsite)
        }
    }
});

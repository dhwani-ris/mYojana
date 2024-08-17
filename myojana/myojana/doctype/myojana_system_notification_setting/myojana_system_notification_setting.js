// Copyright (c) 2024, dhwaniris and contributors
// For license information, please see license.txt

const set_field_list = async (frm) => {
    frappe.model.with_doctype( frm.doc.select_doctype, function() {
        let meta = frappe.get_meta(frm.doc.select_doctype);
        meta.istable == 1 ? frm.set_df_property('select_parent_doctype', 'hidden', 0): frm.set_df_property('select_parent_doctype', 'hidden', 1);
        meta.istable == 1 ? frm.set_df_property('select_parent_doctype', 'reqd', 1): frm.set_df_property('select_parent_doctype', 'reqd', 0);
        console.log(meta);
        let meta_field = meta.fields.filter(field => field.fieldtype === 'Select' || field.fieldtype === 'Link' || field.fieldtype === 'Autocomplete' );
        const result = meta_field.map(item => ({
            value: item.fieldname,
            // lable: item.label
        }));
        frm.fields_dict.table_lrtz.grid.update_docfield_property("select_field", "options", result);
        return meta_field
    });
}

frappe.ui.form.on("mYojana System Notification Setting", {
	refresh(frm) {
        if(!frm.is_new()){
            set_field_list(frm);
            // let meta = frappe.get_meta("");
            // console.log(meta);
        }
	},
    select_doctype(frm){
        set_field_list(frm);
        // let meta = frappe.get_meta(frm.doc.select_doctype);
    }
});
frappe.ui.form.on("System Notification Child", {
    form_render(frm, cdt, cdn){
        let row = locals[cdt][cdn];
        set_field_list(frm);
        console.log("from form render");
    },
    select_action(frm, cdt, cdn){
        let row = locals[cdt][cdn];
        console.log(row);
    }

});

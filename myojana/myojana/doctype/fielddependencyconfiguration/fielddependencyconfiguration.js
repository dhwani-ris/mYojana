// Copyright (c) 2024, suvaidyam and contributors
// For license information, please see license.txt
var field_list = []
function get_field_list(doctype) {
    return new Promise((resolve, reject) => {
        frappe.call({
            method: "myojana.rule_engine.apis.get_meta_api.get_field_lists",
            args: {
                doctype_name: doctype,
                field_types: ['Link']
            },
            callback: function (response) {
                resolve(response.message)
            }
        });
    })

}
frappe.ui.form.on("FieldDependencyConfiguration", {
    async refresh(frm) {
        frm.set_query('myojana_doctype', () => {
            return {
                filters: {
                    module: 'myojana'
                }
            };
        });
    },
    sipms_doctype: async (frm) => {
        field_list = await get_field_list(frm.doc.sipms_doctype);
        console.log(field_list);
    }
});
frappe.ui.form.on("ChildFieldDependecyConfig", {
    refresh(frm) {

    },
    mapping_add: async (frm) => {
        console.log(frm);
        frm.fields_dict.mapping.grid.update_docfield_property("field", "options", field_list);

    }
});


//
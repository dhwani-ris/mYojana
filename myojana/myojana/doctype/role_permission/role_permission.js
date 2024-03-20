// Copyright (c) 2024, dhwaniris and contributors
// For license information, please see license.txt
async function get_field_list (frm) {
    frappe.call({
        method: "myojana.rule_engine.apis.get_meta_api.get_field_lists",
        args: {
            doctype_name: "Beneficiary Profiling",
            field_types: ['Link']
        },
        callback: function (response) {
            // Handle the response
            if (response.message) {
                // frm.fields_dict.scheme_table.grid.open_grid_row.fields_dict.name_of_the_scheme._data = ops
                frm.set_df_property('select_filter_key_from_beneficary', 'options', response.message)
                // return response.message
            } else {
                console.error("API call failed");
            }
        }
    });
}
async function get_user_field_list (frm) {
    frappe.call({
        method: "myojana.rule_engine.apis.get_meta_api.get_field_lists",
        args: {
            doctype_name: "Myojana User",
            field_types: ['Link']
        },
        callback: function (response) {
            // Handle the response
            if (response.message) {
                // frm.fields_dict.scheme_table.grid.open_grid_row.fields_dict.name_of_the_scheme._data = ops.
                frm.set_df_property('select_filter_key_from_user_tables', 'options', response.message)
                // return response.message
            } else {
                console.error("API call failed");
            }
        }
    });

}
frappe.ui.form.on("Role Permission", {
	async refresh(frm) {
        await get_field_list(frm)
        await get_user_field_list(frm)
	},
});

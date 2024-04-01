// Copyright (c) 2023, suvaidyam and contributors
// For license information, please see license.txt
let d = new frappe.ui.Dialog({
    title: 'Add User Permission',
    fields: [
        {
            "fieldname": "select_doctype",
            "fieldtype": "Autocomplete",
            "label": "Select Doctype",
            "options": "State\nDistrict\nBlock\nCentre\nSub Centre"
        },
        {
            "depends_on": "eval:doc.select_doctype==\"State\"",
            "fieldname": "select_states",
            "fieldtype": "Table MultiSelect",
            "label": "Select States",
            "options": "State Child"
        },
        {
            "depends_on": "eval:doc.select_doctype==\"District\"",
            "fieldname": "select_districts",
            "fieldtype": "Table MultiSelect",
            "label": "Select Districts",
            "options": "District Child"
        },
        {
            "depends_on": "eval:doc.select_doctype==\"Block\"",
            "fieldname": "select_blocks",
            "fieldtype": "Table MultiSelect",
            "label": "Select Blocks",
            "options": "Block Child"
        },
        {
            "depends_on": "eval:doc.select_doctype==\"Centre\"",
            "fieldname": "select_centres",
            "fieldtype": "Table MultiSelect",
            "label": "Select Centres",
            "options": "Centre Child"
        },
        {
            "depends_on": "eval:doc.select_doctype==\"Sub Centre\"",
            "fieldname": "select_sub_centres",
            "fieldtype": "Table MultiSelect",
            "label": "Select Sub Centres",
            "options": "Sub Centre Child"
        }
    ],
    primary_action_label: 'Submit',
    primary_action(values) {
        // Log the selected values
        console.log(values);
        // Hide the dialog
        d.hide();
    }
});
function defult_filter(field_name, filter_on, frm) {
    frm.fields_dict[field_name].get_query = function (doc) {
        return {
            filters: {
                [filter_on]: frm.doc.filter_on || `please select ${filter_on}`,
            },
        };
    }
};
function apply_filter(field_name, filter_on, frm, filter_value) {
    frm.fields_dict[field_name].get_query = function (doc) {
        return {
            filters: {
                [filter_on]: filter_value,
            },
            page_length: 1000
        };
    }
};
function extend_options_length(frm, fields) {
    fields.forEach((field) => {
        frm.set_query(field, () => {
            return { page_length: 1000 };
        });
    })
};
function hide_advance_search(frm, list) {
    for (item of list) {
        frm.set_df_property(item, 'only_select', true);
    }
};
frappe.ui.form.on("Myojana User", {
    refresh(frm) {
        frm.doc.password = frm.doc.confirm_password
        frm.doc.state ? apply_filter("centre", "state", frm, frm.doc.state) : defult_filter('centre', "state", frm);
        // frm.doc.centre ? apply_filter("sub_centre", "centre", frm, frm.doc.centre) : defult_filter('sub_centre', "centre", frm);
        extend_options_length(frm, ["state"])
        hide_advance_search(frm, ["role_profile", "state", "centre"])
    },
    role_profile: function (frm) {

    },
    state: function (frm) {
        if (frm.doc.state) {
            apply_filter("centre", "state", frm, frm.doc.state)
        } else {
            defult_filter('centre', "state", frm)
        }
    },
    add_permission: function(frm){
        d.show();
    }
    // centre: function (frm) {
    //     if (frm.doc.centre) {
    //         apply_filter("sub_centre", "centre", frm, frm.doc.centre)
    //     } else {
    //         defult_filter('sub_centre', "centre", frm);
    //     }
    // }
});

// Copyright (c) 2023, suvaidyam and contributors
// For license information, please see license.txt

frappe.ui.form.on("Scheme", {
    async refresh(frm) {
        render_table(frm)
        document.getElementById('export-exel').onclick = function () {
            console.log("hello world")
            get_ben_csv(frm, ["name", 'state.state_name'])
        }
    },
    async onload(frm){
    },
    before_save: async function (frm) {
        if (frm.doc.rules.length > 0) {
            frm.set_value('rules_status', 'Rules')
        } else {
            frm.set_value('rules_status', 'No rules')
        }
    },
    type_of_the_scheme: function (frm) {
        if (frm.doc.type_of_the_scheme != "State") {
            frm.set_value("state", "");
        }
    },
    name_of_department: function (frm) {
        if (frm.doc.department_urlwebsite) {
            frm.add_web_link(frm?.doc?.department_urlwebsite)
        }
    },
    // name_of_beneficiary: async function (frm) {
    //     generate_filters(frm)

    // },
    // primary_member: async function (frm) {
    //     generate_filters(frm)
    // },
    // phone_number: async function (frm) {
    //     generate_filters(frm)
    // },
    // block: async function (frm) {
    //     generate_filters(frm)
    // },
});
const form_events = {
    [`${child_table_field}_add`]: (frm, cdt, cdn) => {
        let initial_code = 64
        let row = frappe.get_doc(cdt, cdn);
        if (row.idx <= 26) {
            row.code = (String.fromCharCode(initial_code + row.idx))
        } else {
            row.code = (String.fromCharCode(initial_code + (row.idx - 26)) + String.fromCharCode(initial_code + (row.idx - 26)))
        }
        get_field_list('rules', frm)
    }
}
frappe.ui.form.on('Rule Engine Child', {
    refresh(frm) {
        generateQueryString(frm.doc[child_table_field])
    },
    form_render(frm) {
        generateQueryString(frm.doc[child_table_field])
    },
    ...form_events,
    rule_field: async function (frm, cdt, cdn) {
        let row = frappe.get_doc(cdt, cdn);
        row.type = field_list?.find(f => f.value == row.rule_field)?.type;
        frm.fields_dict[child_table_field].grid.update_docfield_property("operator", "options", field_types[row.type]);
        let options = field_list.find(f => f.value == row.rule_field)?.options;

        if (row.type == "Link") {
            let link_data = await get_Link_list(options)
            frm.fields_dict[child_table_field].grid.update_docfield_property("select", "options", link_data);
        }
        if (row.type == "Select") {
            let link_data = options?.split('\n').filter(f => f).map(e => { return { 'label': e, 'value': e } })
            frm.fields_dict[child_table_field].grid.update_docfield_property("select", "options", link_data);
        }
        frm.fields_dict[child_table_field].grid.refresh();
        var cur_grid = frm.get_field(`${child_table_field}`).grid;
        var cur_doc = locals[cdt][cdn];
        var cur_row = cur_grid.get_row(cur_doc.name);
        // cur_row.toggle_view();
    },
    data: (frm) => {
        frm.fields_dict[child_table_field].grid.refresh();
        generateQueryString(frm.doc[child_table_field])
    },
    date: function (frm, cdt, cdn) {
        let row = frappe.get_doc(cdt, cdn);
        row.data = row.date
        frm.fields_dict[child_table_field].grid.refresh();
        generateQueryString(frm.doc[child_table_field])
    },
    select: function (frm, cdt, cdn) {
        let row = frappe.get_doc(cdt, cdn);
        row.data = row.select
        frm.fields_dict[child_table_field].grid.refresh();
        generateQueryString(frm.doc[child_table_field])
    },
    value: function (frm, cdt, cdn) {
        let row = frappe.get_doc(cdt, cdn);
        row.data = row.value
        frm.fields_dict[child_table_field].grid.refresh();
        generateQueryString(frm.doc[child_table_field])
    }
})
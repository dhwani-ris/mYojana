// Copyright (c) 2024, dhwaniris and contributors
// For license information, please see license.txt
const get_doctype_list = async (frm) => {
    let list = await callAPI({
      method: 'myojana.apis.get_doctype_meta.get_allowed_doctype',
      freeze: true,
      args: {
        "doctype_name":"Beneficiary Profiling",
        "field_types":"Link"
      },
      freeze_message: __("Getting Fields..."),
    })
    cur_frm.cur_grid.grid_form.fields_dict.doctypes._data = list
    // frm.fields_dict.select_doctypes.grid.open_grid_row.fields_dict.doctypes._data = list;
    return list;
  }
frappe.ui.form.on("mYojana Settings", {
	async refresh(frm) {
       
	},
});

frappe.ui.form.on('Setting Doctype Child', {
    form_render: async function (frm, cdt, cdn) {
        await get_doctype_list()
    },
    select_doctypes_add: async function (frm, cdt, cdn) {
      console.log("hello everyone")
    }
  })
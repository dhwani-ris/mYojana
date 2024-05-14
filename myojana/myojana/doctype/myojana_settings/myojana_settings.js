// Copyright (c) 2024, dhwaniris and contributors
// For license information, please see license.txt
// const get_doctype_list = async () => {
//     let list = await callAPI({
//       method: 'myojana.apis.get_doctype_meta.get_allowed_doctype',
//       freeze: true,
//       args: {
//         "doctype_name":"Beneficiary Profiling",
//         "field_types":"Link"
//       },
//       freeze_message: __("Getting Fields..."),
//     })
//     cur_frm.cur_grid.grid_form.fields_dict.doctypes._data = list
//     // frm.fields_dict.select_doctypes.grid.open_grid_row.fields_dict.doctypes._data = list;
//     return list;
//   }
let deleted_row = [];
const get_fields_list = async (doctype) => {
  let list = await callAPI({
    method: 'myojana.apis.get_doctype_meta.get_allowed_doctype',
    freeze: true,
    args: {
      "doctype_name": "Beneficiary Profiling",
      "field_types": "Link",
      "options": doctype
    },
    freeze_message: __("Getting Fields..."),
  })
  // list = list.map((e)=>{e.label = list.label, e.value = list.label})
  cur_frm.cur_grid.grid_form.fields_dict.field_name._data = list
  // frm.fields_dict.select_doctypes.grid.open_grid_row.fields_dict.doctypes._data = list;
  return list;
}
const toggle_track_changes = async (items, value) => {
  let list = await callAPI({
    method: 'myojana.apis.track_seen.toggle_track_changes',
    freeze: true,
    args: {
      'list': items,
      "value": value
    },
    freeze_message: __("Updating Track Changes..."),
  })
  return list;
}
const apply_filter_on_doctypes = async (frm) => {
  //  APPLY Filter in ID DOCUMENT
  var child_table = frm.fields_dict['enable_track_changes'].grid;
  if (child_table) {
    try {
      child_table.get_field('doc').get_query = function () {
        return {
          filters: [
            ["DocType", "module", "IN", ["Sva Report", "Rule Engine", "Master", "myojana"]],
            ["DocType", "istable", "=", 0],
            ['DocType', 'name', 'NOT IN', cur_frm.doc.enable_track_changes.map(function (item) {
              return item.doc;
            })]
          ]
        };
      };
    } catch (error) {
      console.error(error)
    }
  }
}
frappe.ui.form.on("mYojana Settings", {
  async refresh(frm) {
  },
  async before_save(frm) {
    const disable_tracking = deleted_row.map((item) => { return item.doc });
    if (disable_tracking.length) {
      await toggle_track_changes(disable_tracking, 0)
    }
    const enable_tracking = frm.doc.enable_track_changes.map((item) => { return item.doc });
    if (enable_tracking.length) {
      await toggle_track_changes(enable_tracking, 1);
    }
    deleted_row = [];
  }
});

frappe.ui.form.on('Setting Doctype Child', {
  form_render: async function (frm, cdt, cdn) {
    let row = frappe.get_doc(cdt, cdn);
    row.doctypes && await get_fields_list(row.doctypes)
  },
  select_doctypes_add: async function (frm, cdt, cdn) {
    console.log("hello everyone")
  },
  doctypes: async function (frm, cdt, cdn) {
    let row = frappe.get_doc(cdt, cdn);
    row.doctypes && await get_fields_list(row.doctypes)
  }
})
frappe.ui.form.on('DocType Child', {
  form_render: async function (frm, cdt, cdn) {
    await apply_filter_on_doctypes(frm)
  },
  enable_track_changes_add: async function (frm, cdt, cdn) {
    await apply_filter_on_doctypes(frm)
  },
  before_enable_track_changes_remove: async function (frm, cdt, cdn) {
    let row = frappe.get_doc(cdt, cdn);
    deleted_row.push(row)
  }
})
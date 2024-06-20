// Copyright (c) 2023, Rahul Sah and contributors
// For license information, please see license.txt
var fields = []
var checked_data = []
var new_checked_data = []
// Calling APIs Common function
function callAPI(options) {
  return new Promise((resolve, reject) => {
    frappe.call({
      ...options,
      callback: async function (response) {
        resolve(response?.message || response?.value)
      }
    });
  })
}
async function arrangeFields(fields, checked_data = []) {
  const groupedFields = {};
  await fields.forEach(field => {
    const doctype = field.doc_type || 'default';
    if (!groupedFields[doctype]) groupedFields[doctype] = [];
    groupedFields[doctype].push(field);
  });
  return Object.entries(groupedFields).flatMap(([doctype, fields]) => [
    { fieldname: `${doctype}_section_break`, fieldtype: "Section Break", label: `${doctype} Details` },
    ...fields.map(field => {
      field.label = `${field.label}${field?.link_table?.label?' ('+field?.link_table?.label+')':''}`
      if (checked_data.length > 0 && checked_data.includes(field.fieldname)) {
        return {
          fieldname: field.fieldname, fieldtype: "Check", label: field.label, ft: field.fieldtype, default: 1, onchange: (e) => {
            if (e.currentTarget.checked) {
              new_checked_data.push(field.fieldname)
            } else {
              new_checked_data = new_checked_data.filter((doc) => doc !== field.fieldname)
            }
            console.log(new_checked_data)
          }
        }
      } else {
        return {
          fieldname: field.fieldname, fieldtype: "Check", label: field.label, ft: field.fieldtype, default: 0, onchange: (e) => {
            if (e.currentTarget.checked) {
              if (!new_checked_data.includes(field.fieldname)) {
                new_checked_data.push(field.fieldname)
              }
            } else {
              new_checked_data = new_checked_data.filter((doc) => doc !== field.fieldname)
            }
          }
        }
      }
    })
  ]);
}
frappe.ui.form.on("SVA Report", {
  refresh(frm) {

  },
  map_columns: async (frm) => {
    if (!fields.length) {
      fields = await callAPI({
        method: 'myojana.sva_report.controllers.get_report_data.get_fields',
        args: {
          doc: frm.doc.ref_doctype
        },
        freeze_message: __("Getting fields..."),
      })
    }
    checked_data = await callAPI({
      method: 'myojana.sva_report.controllers.child_table_crud.get_all_child_doc',
      args: {
        doctype: "Report Column",
        parent: frm.doc.name,
        parentfield: "columns",
        parenttype: "SVA Report",
      },
      freeze_message: __("Getting fields..."),
    })
    if (checked_data.length > 0) {
      new_checked_data = [...checked_data]
    }
    const arrangedFields = await arrangeFields(fields, checked_data);
    let dialog_fields = [...arrangedFields]
    var d = new frappe.ui.Dialog({
      'title': "Fields",
      'fields': dialog_fields,
      primary_action: async function (obj) {
        const checked_docs = d?.fields
          ?.filter(field => new_checked_data?.includes(field?.fieldname))
          ?.sort((a, b) => {
            const indexA = new_checked_data.indexOf(a.fieldname);
            const indexB = new_checked_data.indexOf(b.fieldname);
            return indexA - indexB;
          });
        await callAPI({
          method: 'myojana.sva_report.controllers.child_table_crud.delete_all_child_doc',
          args: {
            doctype: "Report Column",
            parent: frm.doc.name,
            parentfield: "columns",
            parenttype: "SVA Report",
          },
          freeze_message: __("Mapping columns..."),
        })
        if (checked_docs.length > 0) {
          await checked_docs?.forEach(async (doc, index) => {
            await callAPI({
              method: 'myojana.sva_report.controllers.child_table_crud.insert_child_doc',
              args: {
                doctype: "Report Column",
                parent: frm.doc.name,
                parentfield: "columns",
                parenttype: "SVA Report",
                fieldname: doc.fieldname,
                label: doc.label,
                fieldtype: doc.ft,
                idx: index + 1
              },
              freeze_message: __("Mapping columns..."),
            })
          });
        }
        d.hide();
        checked_data = []
        new_checked_data = []
        frm.debounced_reload_doc();
      }
    });
    d.show();
  }
});

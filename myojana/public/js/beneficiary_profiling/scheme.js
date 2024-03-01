var scheme_list = []

const showRules = (row) => {
  let rules = (row?.rules || []).map(e => `${e.rule_field} ${e.operator} ${e.data} ${e.check}`).join("\n")
  frappe.msgprint({
    title: __('rules'),
    message: rules,
    primary_action: {
      action(values) {
        console.log(values);
      }
    }
  });
}
// get scheme lists
const get_scheme_list = async (frm) => {
  let list = await callAPI({
    method: 'sipms.api.execute',
    freeze: true,
    args: {
      name: frm.doc.name
    },
    freeze_message: __("Getting schemes..."),
  })
  scheme_list = list.sort((a, b) => b.matching_rules_per - a.matching_rules_per);
  return scheme_list
}
const addTableFilter = (datatable, elements = [], rows = []) => {
  document.addEventListener('keyup', function (event) {
    if (elements.includes(event.target.id)) {
      let filters = []
      for (el of elements) {
        let val = document.getElementById(el)?.value;
        if (val) {
          filters.push([el, val])
        }
      }
      if (filters.length) {
        datatable.refresh(rows.filter(row => !filters.map(e => (row[e[0]]?.toString()?.toLowerCase()?.indexOf(e[1]?.toLowerCase()) > -1)).includes(false)))
      } else {
        datatable.refresh(rows)
      }
    }
  });
}

// ********************* Support CHILD Table***********************
frappe.ui.form.on('Scheme Child', {
    form_render: async function (frm, cdt, cdn) {
      let row = frappe.get_doc(cdt, cdn);
      if (row.__islocal) {
        if (row.application_submitted == 'Yes' && (!row.date_of_application || !row.mode_of_application)) {
          row.status = ''
          createDialog(row, dialogsConfig.document_submitted, doc_submitted_validate).show();
        } else if (row.application_submitted == 'Completed' && (!row.date_of_application || !row.mode_of_application)) {
          createDialog(row, dialogsConfig.document_completed_frm_support, date_of_complete_validate).show();
        }
      }
    },
    scheme_table_add: async function (frm, cdt, cdn) {
      // get_milestone_category(frm)
      let schemes_op = frm.doc.scheme_table.filter(f => ['Open', 'Under process', 'Closed', ''].includes(f.status)).map(e => e.name_of_the_scheme);
      let fl_schemes_ops = scheme_list.filter(f => !schemes_op.includes(f.name) && f.available)
      let milestones = {};
      let ops = fl_schemes_ops.map(e => {
        milestones.hasOwnProperty(e.milestone) ? '' : milestones[e.milestone] = e.milestone
        return { 'lable': e.name, "value": e.name }
      })
      frm.fields_dict.scheme_table.grid.update_docfield_property("name_of_the_scheme", "options", ops);
      frm.fields_dict.scheme_table.grid.update_docfield_property("milestone_category", "options", [{ 'lable': "", "value": "" }, ...Object.keys(milestones).map(e => { return { 'lable': milestones[e], "value": milestones[e] } })]);
    },
    name_of_the_scheme: function (frm, cdt, cdn) {
      let row = frappe.get_doc(cdt, cdn);
      row.milestone_category = ''
      let scheme = scheme_list.find(f => row.name_of_the_scheme == f.name)
  
      if (scheme) {
        row.milestone_category = scheme.milestone;
        // row.mode_of_application = scheme.mode_of_application;
        row.name_of_the_department = scheme.name_of_department;
      }
      refresh_field("scheme_table")
    },
    milestone_category: (frm, cdt, cdn) => {
      let row = frappe.get_doc(cdt, cdn);
      row.name_of_the_scheme = ''
      let schemes;
      if (row.milestone_category === "") {
        schemes = scheme_list;
      } else {
        schemes = scheme_list.filter(f => row.milestone_category == f.milestone);
      }
      let schemes_op = frm.doc.scheme_table.filter(f => ['Open', 'Under process', 'Closed', ''].includes(f.status)).map(e => e.name_of_the_scheme);
      let fl_schemes_ops = schemes.filter(f => !schemes_op.includes(f.name) && f.available)
      let milestones = {};
      let ops = fl_schemes_ops.map(e => {
        milestones.hasOwnProperty(e.milestone) ? '' : milestones[e.milestone] = e.milestone
        return { 'lable': e.name, "value": e.name }
      })
      frm.fields_dict.scheme_table.grid.update_docfield_property("name_of_the_scheme", "options", ops);
    },
    application_submitted: function (frm, cdt, cdn) {
      let row = frappe.get_doc(cdt, cdn);
      if (row.application_submitted == "Yes") {
        row.status = ''; row.date_of_completion = '';
        frm.refresh_fields('status', 'date_of_completion')
        createDialog(row, dialogsConfig.document_submitted, doc_submitted_validate).show();
      } else if (["Completed"].includes(row.application_submitted)) {
        createDialog(row, dialogsConfig.document_completed_frm_support, date_of_complete_validate).show();
      } else if (row.application_submitted == "No") {
        row.date_of_application = ''; row.date_of_completion = ''; row.application_number = ''; row.amount_paid = ''; row.paid_by = "";
        frm.refresh_fields("date_of_application", "date_of_completion", "application_number", "amount_paid", "paid_by");
      }
    },
  
  })
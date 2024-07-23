// ********************* FOLLOW UP CHILD Table***********************
frappe.ui.form.on('Follow Up Child', {
  form_render: async function (frm, cdt, cdn) {
    let row = frappe.get_doc(cdt, cdn);
    if (frm.fields_dict.follow_up_table.grid && row.name_of_the_scheme) {
      let _local_scheme_followups = frm.doc.follow_up_table.filter(f => f.__islocal).map(e => e.name_of_the_scheme);
      let support_data = frm.doc.scheme_table.filter(f => ['Open', 'Under process', 'Closed'].includes(f.status) && !_local_scheme_followups.includes(f.scheme)).map(m => m.name_of_the_scheme);
      frm.fields_dict.follow_up_table.grid.update_docfield_property("name_of_the_scheme", "options", [...support_data, row.name_of_the_scheme]);
    }
  },
  async follow_up_table_add(frm, cdt, cdn) {
    let row = frappe.get_doc(cdt, cdn);
    if (frappe.user_roles.includes("Sub-Centre")) {
      let sub_centre = await get_ordered_list("Sub Centre", false)
      frm.fields_dict.follow_up_table.grid.update_docfield_property("follow", "options", sub_centre);
    } else {
      frm.fields_dict.follow_up_table.grid.update_docfield_property("follow", "options", [`${frappe.session.user_fullname}`]);
      row.follow = frappe.session.user_fullname
    }
    // call api of list of subcentre with checking roles
    let _local_scheme_followups = frm.doc.follow_up_table.filter(f => f.__islocal).map(e => e.name_of_the_scheme)
    let support_data = frm.doc.scheme_table.filter(f => ['Open', 'Under process', 'Closed'].includes(f.status) && !_local_scheme_followups.includes(f.scheme)).map(m => m.name_of_the_scheme);
    frm.fields_dict.follow_up_table.grid.update_docfield_property("name_of_the_scheme", "options", support_data);
  },
  name_of_the_scheme: function (frm, cdt, cdn) {
    let row = frappe.get_doc(cdt, cdn);
    let supports = frm.doc.scheme_table.filter(f => f.scheme == row.name_of_the_scheme && (['Open', 'Under process', 'Closed'].includes(f.status)));
    row.date_of_application = supports[0].date_of_application
    row.follow_up_date = frappe.datetime.get_today()
    // console.log(supports, "supports")
    row.parent_ref = supports[0].name
    for (support_items of frm.doc.scheme_table) {
      if (row.name_of_the_scheme == support_items.name_of_the_scheme) {
        if (support_items.status === "Open" && support_items.application_submitted == "No") {
          frm.fields_dict.follow_up_table.grid.update_docfield_property("follow_up_with", "options", ["Beneficiary"]);
          row.follow_up_with = "Beneficiary"
          frm.fields_dict.follow_up_table.grid.update_docfield_property("follow_up_status", "options", ["Interested", "Not interested", "Document submitted", "Not reachable"]);
        } else if (support_items.status === "Under process" && support_items.application_submitted == "Yes") {
          frm.fields_dict.follow_up_table.grid.update_docfield_property("follow_up_with", "options", ["Beneficiary", "Government department", "Government website", "Others"]);
          frm.fields_dict.follow_up_table.grid.update_docfield_property("follow_up_status", "options", ["Not reachable", "Under process", "Additional info required", "Completed", "Rejected"]);
        } else if (support_items.status === "Closed" && support_items.application_submitted == "Yes") {
          // last call update  ?? confusion changes
          frm.fields_dict.follow_up_table.grid.update_docfield_property("follow_up_with", "options", ["Beneficiary", "Government department", "Government website", "Others"]);
          frm.fields_dict.follow_up_table.grid.update_docfield_property("follow_up_status", "options", ["Not reachable", "Under process", "Additional info required", "Completed", "Rejected"]);
        } else if (support_items.status === "Closed" && support_items.application_submitted == "No") {
          frm.fields_dict.follow_up_table.grid.update_docfield_property("follow_up_with", "options", ["Beneficiary"]);
          row.follow_up_with = "Beneficiary"
          frm.fields_dict.follow_up_table.grid.update_docfield_property("follow_up_status", "options", ["Interested", "Not interested", "Document submitted", "Not reachable"]);
        }
      }
    }
  },
  follow_up_date: function (frm, cdt, cdn) {
    let row = frappe.get_doc(cdt, cdn);
    // console.log("follow up", row)
  },
  follow_up_date: function (frm, cdt, cdn) {
    let row = frappe.get_doc(cdt, cdn);
    if (row.follow_up_date > frappe.datetime.get_today()) {
      row.follow_up_date = null
      frappe.throw(__("You can not select future date in Follow-up date"));
    }
    if (row.follow_up_date < row.date_of_application) {
      row.follow_up_date = null
      frappe.throw(__("Follow-up date should not be less than date of application"));
    }
    if (row.follow_up_date < frm.doc.date_of_visit) {
      row.follow_up_date = null
      frappe.throw(__("Follow-up date should not be less than date of date of registration"));
    }
  },
  follow_up_with: function (frm, cdt, cdn) {
    let row = frappe.get_doc(cdt, cdn);
    if (row.follow_up_with == "Government department" || row.follow_up_with == "Others") {
      frm.fields_dict.follow_up_table.grid.update_docfield_property("follow_up_mode", "options", ["Phone call", "In-person visit"]);
    } else {
      frm.fields_dict.follow_up_table.grid.update_docfield_property("follow_up_mode", "options", ["Phone call", "Home visit", "Centre visit"]);
    }
    let supports = frm.doc.scheme_table.filter(f => f.specific_support_type == row.support_name);
    let latestSupport = supports.length ? supports[supports.length - 1] : null;
    if (row.follow_up_with != "Beneficiary" && latestSupport.application_submitted == "Yes") {
      frm.fields_dict.follow_up_table.grid.update_docfield_property("follow_up_status", "options", ["Not reachable", "Under process", "Additional info required", "Completed", "Rejected"]);
    } else if (row.follow_up_with == "Beneficiary" && latestSupport.application_submitted == "Yes") {
      frm.fields_dict.follow_up_table.grid.update_docfield_property("follow_up_status", "options", ["Not reachable", "Under process", "Additional info required", "Completed", "Rejected"]);
    } else if (row.follow_up_with == "Beneficiary" && latestSupport.application_submitted == "No") {
      frm.fields_dict.follow_up_table.grid.update_docfield_property("follow_up_status", "options", ["Interested", "Not interested", "Document submitted", "Not reachable"]);
    }
  },
  follow_up_status: function (frm, cdt, cdn) {
    let row = frappe.get_doc(cdt, cdn);
    let supports = frm.doc.scheme_table.filter(f => f.specific_support_type == row.support_name);
    let latestSupport = supports.length ? supports[supports.length - 1] : null;
    if (row.follow_up_status === "Not reachable" && latestSupport.status != "Closed") {
      let followups = frm.doc.follow_up_table.filter(f => f.parent_ref == row.parent_ref && f.support_name == row.support_name && f.follow_up_status == "Not reachable")
      if (followups.length >= 2) {
        frappe.warn('Do you want to close the scheme?',
          `The follow-up status is "Not reachable" ${followups.length} times`,
          () => {
            row.to_close_status = "Closed"
            console.log(row, "row")
          },
          'Close',
          true // Sets dialog as minimizable
        )

      }
      //  show popup and continue and close if more than two times
    }
  },
  date_of_application:function(frm , cdt , cdn){
    let row = frappe.get_doc(cdt, cdn);
    if(row.date_of_application < frm.doc.date_of_visit){
      row.date_of_application = ''
      frappe.throw(__("Date of application should not be less than date of registration"));
    }else if (row.date_of_application > frappe.datetime.get_today()) {
      row.date_of_application = ''
      frappe.throw(__("Date of application should not be greater than today's date"));
    }
  },
  date_of_completion: function(frm , cdt, cdn){
    let row = frappe.get_doc(cdt, cdn);
    if(row.date_of_application < frm.doc.date_of_visit){
      row.date_of_completion = ''
      frappe.throw(__("Date of application should not be less than date of registration"))
    } else if (row.date_of_completion < frm.doc.date_of_visit){
      row.date_of_completion = ''
      frappe.throw(__("Date of completion should not be less than date of registration"))
    }else if (row.date_of_completion > frappe.datetime.get_today()){
      row.date_of_completion = ''
      frappe.throw(__("Date of completion should not be greater than today's date"))
    }else if((row.date_of_completion < row.date_of_application)){
      //  modified this logic
      row.date_of_completion = ''
      frappe.throw(__("Date of completion should not be less than Date of Application"))
    }
  },
  date_of_rejection:function(frm, cdt, cdn){
    let row = frappe.get_doc(cdt, cdn);
    if (row.date_of_rejection < frm.doc.date_of_visit){
      row.date_of_rejection = ''
      frappe.throw(__("Date of rejection should not be less than date of registration"))
    }else if((row.date_of_rejection < row.date_of_application)){
      // mmay be need modify
      row.date_of_rejection = ''
      frappe.throw(__("Date of rejection should not be less than date of application"))
    }else if (row.date_of_rejection > frappe.datetime.get_today()) {
      row.date_of_rejection = ''
      frappe.throw(__("Date of rejection should not be greater than today's date"))
    }
  }

})
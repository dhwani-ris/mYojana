// Copyright (c) 2023, suvaidyam and contributors
// // For license information, please see license.txt
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
async function autoSetOption(frm) {
  let centres = await callAPI({
      method: 'frappe.desk.search.search_link',
      freeze: true,
      args: {
        txt:'',
        doctype:"Centre",
        reference_doctype: "Beneficiary Profiling"
      },
      freeze_message: __("Getting Centres"),
    })
    if(centres?.length){
      frm.set_value("centre",centres[0].value)
      // let sub_centres = await callAPI({
      //   method: 'frappe.desk.search.search_link',
      //   freeze: true,
      //   args: {
      //     txt:'',
      //     doctype:"Sub Centre",
      //     reference_doctype: "Beneficiary Profiling",
      //     filters: {"centre":centres[0].value}
      //   },
      //   freeze_message: __("Getting Sub Centres"),
      // })
      // if(sub_centres?.length){
      //   frm.set_value("sub_centre",sub_centres[0].value)
      // }
    }
}
frappe.ui.form.on("Beneficiary Profiling", {
  /////////////////  CALL ON SAVE OF DOC OR UPDATE OF DOC ////////////////////////////////
  before_save: async function (frm) {
    console.log("before save")
    if ((frm.doc.completed_age || frm.doc.completed_age_month) && !frm.doc?.date_of_birth) {
      await frm.set_value("date_of_birth", generateDOBFromAge(frm.doc?.completed_age, frm.doc?.completed_age_month, frm.doc?.date_of_birth))
    }
    // fill into hidden fields
    if (frm.doc?.scheme_table && frm.doc?.scheme_table?.length) {
      for (_doc of frm.doc.scheme_table) {
        _doc.scheme = _doc.name_of_the_scheme;
        _doc.milestone = _doc.milestone_category;
      }
    }
    // check alternate mobile number digits
    if (frm.doc.alternate_contact_number || frm.doc.contact_number) {
      const indianPhoneNumberRegex = /^(?:(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9})$/;
      if (!indianPhoneNumberRegex.test(frm.doc.alternate_contact_number) && frm.doc.alternate_contact_number?.length > 1) {
        frappe.throw(`Phone Number <b>${frm.doc.alternate_contact_number}</b> set in field alternate_contact_number is not valid.`)
      }
      if (!indianPhoneNumberRegex.test(frm.doc.contact_number)) {
        frappe.throw(`Phone Number <b>${frm.doc.contact_number}</b> set in field contact_number is not valid.`)
      }
    }
    if (frm.doc.do_you_have_id_document == "Yes" && frm.doc.id_section?.length == '0') {
      if (!(frm.doc.id_section[0] && frm.doc?.id_section[0]?.select_id != "undefined")) {
        frappe.throw(__('Please Select Which of the following ID documents do you have?'));
      }
      return
    }
    // support status manage
    if (frm.selected_doc.scheme_table) {
      for (support_items of frm.selected_doc.scheme_table) {
        if (support_items.application_submitted == "No") {
          if (support_items.status != 'Closed') {
            support_items.status = 'Open'
          }
        } else if (support_items.application_submitted == "Yes") {
          if (support_items.status != 'Closed') {
            support_items.status = 'Under process'
          }
        } else if (support_items.application_submitted == "Previously availed") {
          support_items.status = 'Availed'
        } else if (support_items.application_submitted == "Completed") {
          support_items.status = 'Completed'
        }
      }
    }
    // follow up status manage
    if (frm.selected_doc.follow_up_table) {
      console.log("frm.selected_doc.follow_up_table", frm.selected_doc.follow_up_table)
      for (support_item of frm.selected_doc.scheme_table) {
        if (!['Completed', 'Previously availed'].includes(support_item.status)) {
          let followups = frm.selected_doc.follow_up_table.filter(f => f.parent_ref == support_item?.name)
          // debugger;
          let latestFollowup = followups.length ? followups[(followups.length - 1)] : null
          if (latestFollowup?.parent_ref == support_item.name) {
            switch (latestFollowup.follow_up_status) {
              case "Interested":
                support_item.status = "Open"
                break;
              case "Not interested":
                support_item.status = "Closed"
                break;
              case "Rejected":
                support_item.status = "Rejected"
                support_item.date_of_rejection = latestFollowup.date_of_rejection || support_item.date_of_rejection
                support_item.reason_of_rejection = latestFollowup.reason_of_rejection || support_item.reason_of_rejection
                break;
              case "Document submitted":
                support_item.application_submitted = "Yes"
                support_item.status = "Under process"
                support_item.mode_of_application = latestFollowup.mode_of_application || support_item.mode_of_application
                support_item.date_of_application = latestFollowup.date_of_application || support_item.date_of_application
                support_item.application_number = latestFollowup.application_number || support_item.application_number
                support_item.amount_paid = latestFollowup.amount_paid || support_item.amount_paid
                support_item.paid_by = latestFollowup.paid_by || support_item.paid_by
                break;
              case "Completed":
                support_item.status = "Completed"
                support_item.date_of_completion = latestFollowup.date_of_completion || support_item.date_of_completion
                support_item.completion_certificate = latestFollowup.completion_certificate || support_item.completion_certificate
                break;
              case "Not reachable":
                if (support_item.status != "Closed") {
                  if (latestFollowup.to_close_status) {
                    support_item.status = latestFollowup.to_close_status
                  }
                  // else {
                  // support_item.status = support_item?.application_submitted == "Yes" ? "Under process" : "Open"
                  // }
                }
                break;
              default:
                support_item.status = "Under process"
                break;
            }
          }
        }
      }

    }

    let open, under_process, form_submitted, rejected, completed, closed;
    open = under_process = form_submitted = rejected = completed = closed = 0;
    let total_no_of_support = 0
    if (frm.selected_doc.scheme_table) {
      for (item of frm.selected_doc.scheme_table) {
        // global_data.push(item)
        ++total_no_of_support
        if (item.status === 'Open') {
          ++open
        } else if (item.status === 'Under process') {
          ++under_process
        } else if (item.status === 'Form submitted') {
          ++form_submitted
        } else if (item.status === 'Rejected') {
          ++rejected
        } else if (item.status === 'Completed' || item.status === 'Previously availed') {
          ++completed
        } else {
          ++closed
        }
      }
    }
    let numberic_overall_status = (completed + rejected) + '/' + (completed + rejected + form_submitted + under_process + open)
    frm.doc.numeric_overall_status = numberic_overall_status;
    if (total_no_of_support === open) {
      frm.doc.overall_status = 'Open'
    } else if (total_no_of_support === completed) {
      frm.doc.overall_status = 'Completed'
    } else {
      if (total_no_of_support === open + under_process + form_submitted) {
        frm.doc.overall_status = 'Open'
      } else if (total_no_of_support === completed + closed + rejected) {
        frm.doc.overall_status = 'Completed'
      } else {
        frm.doc.overall_status = 'Partially completed'
      }
    }
    // validation of date of application
    await validate_date_of_application(frm);
  },
  async refresh(frm) {
    _frm = frm
    if(frm.is_new()){
      await autoSetOption(frm);
    }
    if (frm.doc.lead && frm.doc.__islocal) {
      get_lead_date(frm.doc.lead, frm)
    }
    apply_filter_on_id_document()
    // read only fields
    if (!frappe.user_roles.includes("Administrator")) {
      if (!frm.doc.__islocal) {
        // if(frm.doc.centre){
        //   frm.set_df_property('centre', 'read_only', 1);
        //   // apply_filter("sub_centre", "centre", frm, frm.doc.centre)
        // }
        // if(frm.doc.sub_centre){
        //   frm.set_df_property('sub_centre', 'read_only', 1);
        // }
        frm.set_df_property('centre', 'read_only', 1);
        frm.set_df_property('sub_centre', 'read_only', 1);
        frm.set_df_property('date_of_visit', 'read_only', 1);
      }
    }
    if (!frm.is_new()) {
      frm.add_custom_button(__('Add family members'), function () {
        frappe.route_options = {
          has_anyone_from_your_family_visisted_before: "Yes",
          select_primary_member: frm.doc.select_primary_member || frm.doc.contact_number,
        };
        // Open a new form for the desired DocType
        frappe.new_doc('Beneficiary Profiling');
      }, __());
    }
    // set dropdown value by ordering
    // frm.set_df_property('current_house_type', 'options', await get_ordered_list("House Types", ["Own", "Rented", "Relative's home", "Government quarter", "Others"]));

    // hide delete options for subcentre and csc member
    apply_filter('select_primary_member', 'name_of_head_of_family', frm, ['!=', frm.doc.name])

    if (frappe.user_roles.includes("Sub-Centre") || frappe.user_roles.includes("CSC Member") || frappe.user_roles.includes("MIS executive")) {
      if (!frappe.user_roles.includes("Administrator")) {
        frm.set_df_property('scheme_table', 'cannot_delete_rows', true); // Hide delete button
        frm.set_df_property('scheme_table', 'cannot_delete_all_rows', true);
        frm.set_df_property('follow_up_table', 'cannot_delete_rows', true); // Hide delete button
        frm.set_df_property('follow_up_table', 'cannot_delete_all_rows', true);
        // frm.set_df_property('id_table_list', 'cannot_delete_rows', true); // Hide delete button
        // frm.set_df_property('id_table_list', 'cannot_delete_all_rows', true);
      }
    }

    extend_options_length(frm, ["centre", "sub_centre", "religion", "caste_category", "marital_status", "current_house_type",
      "source_of_information", "current_house_type", "state", "district", "occupational_category", "education",
      "education", "ward", "name_of_the_settlement", "proof_of_disability", "block", "state_of_origin", "current_occupation", "district_of_origin", "social_vulnerable_category", "name_of_the_camp"])
    frm.set_query('religion', () => {
      return {
        order_by: 'religion.religion ASC'
      };
    });
    scheme_list = await get_scheme_list(frm)
    let tableConf = {
      columns: [
        {
          name: " ",
          id: 'serial_no',
          editable: false,
          resizable: true,
          sortable: false,
          focusable: false,
          dropdown: false,
          width: 70,
          format: (value, columns, ops, row) => {
            return (columns?.[0]?.rowIndex + 1)
          }
        },
        {
          name: "Name",
          id: 'name',
          editable: false,
          resizable: false,
          sortable: false,
          focusable: false,
          dropdown: false,
          width: 400
        },
        {
          name: "Milestone",
          id: 'milestone',
          editable: false,
          resizable: false,
          sortable: false,
          focusable: false,
          dropdown: false,
          width: 200
        },
        {
          name: "Matches",
          id: 'matches',
          editable: false,
          resizable: false,
          sortable: false,
          focusable: false,
          dropdown: false,
          width: 90,
          format: (value, columns, ops, row) => {
            let rules = row?.rules?.map(e => `${e.message} ${e.matched ? '&#x2714;' : '&#10060;'}`).join("\n").toString()
            return `<p title="${rules}">${row?.matches?.bold()}</p>`
          }
        },
        {
          name: "Group",
          id: 'group',
          editable: false,
          resizable: false,
          sortable: false,
          focusable: false,
          dropdown: false,
          width: 70,
          format: (value, columns, ops, row) => {
            let messages = row.groups.map(g => (g.rules?.map(e => `${e.message} ${e.matched ? '&#x2714;' : '&#10060;'}`).join("\n").toString()))
            return `<p title="${messages.join('\n--------------   \n')}">${row?.groups?.filter(f => f.percentage == 100)?.length?.toString()?.bold()}/${row?.groups?.length?.toString()?.bold()}</p>`
          }
        },
        //milestone
        // {
        //   name: "Availed",
        //   id: 'availed',
        //   editable: false,
        //   resizable: false,
        //   sortable: false,
        //   focusable: false,
        //   dropdown: false,
        //   width: 100,
        //   format: (value, columns, ops, row) => {
        //     return `<p style="text-align:center; color:green; font-size:18px; font-weight:600;">${value ? '' : '&#x2714;'}</p>`
        //   }
        // }
      ],
      rows: []
    };
    let scheme_row_list = scheme_list.map((scheme, i) => {
      return scheme.available && {
        scheme_name: scheme?.name,
        name: `<a href="/app/scheme/${scheme?.name}">${scheme.name}</a>`,
        matches: `<a href="/app/scheme/${scheme?.name}">${scheme.matching_rules}/${scheme?.total_rules}</a>`,
        rules: scheme.rules,
        groups: scheme.groups,
        availed: scheme.available,
        milestone: scheme.milestone
      }
    }).filter(f => f);

    const container = document.getElementById('all_schemes');
    const datatable = new DataTable(container, { columns: tableConf.columns, serialNoColumn: false });
    datatable.style.setStyle(`.dt-scrollable`, { height: '300px!important', overflow: 'scroll!important' });
    addTableFilter(datatable, ['scheme_name', 'milestone'], scheme_row_list)
    datatable.refresh(scheme_row_list);
    // if not is local
    if (frm.doc.__islocal) {
      frm.doc.added_by = frappe.session.user
      refresh_field("added_by")
    }

    // set  defult date of visit
    if (frm.doc.__islocal && !frm.doc.date_of_visit) {
      frm.set_value('date_of_visit', frappe.datetime.get_today());
    }
    // Hide Advance search options
    hide_advance_search(frm, ["state", "district", "ward", "state_of_origin", "religion", "caste_category", "marital_status",
      "district_of_origin", "block", "gender", "current_occupation",
      , "social_vulnerable_category", "pwd_category", "family",
      "sub_centre", "centre", "source_of_information", "occupational_category",
      "current_house_type", "name_of_the_settlement", "name_of_the_camp", "proof_of_disability", "education"
    ])

    apply_filter("district", "State", frm, frm.doc.state)
    apply_filter("ward", "District", frm, frm.doc.district)
    apply_filter("name_of_the_settlement", "block", frm, frm.doc.ward)
    apply_filter("district_of_origin", "State", frm, frm.doc.state_of_origin)
    apply_filter("block", "District", frm, frm.doc.district_of_origin)
    apply_filter("sub_centre", "centre", frm, frm.doc.centre)
    // defult filter on current occupations
    if (frm.doc?.current_occupation) {
      if (frm.doc.current_occupation == 'Others') {
        apply_filter('occupational_category', 'name', frm, '', true)
      } else {
        let doc = await get_occupation_category(frm)
        apply_filter('occupational_category', 'name', frm, ['=', doc.occupational_category])
        frm.set_value('occupational_category', doc.occupational_category)
      }
    }
    if (frappe.user_roles.includes("Admin")) {
      apply_filter("sub_centre", "centre", frm, frm.doc.centre)
    }
  },
  // validate(frm) {

  // },
  ////////////////////DATE VALIDATION/////////////////////////////////////////
  date_of_visit: function (frm) {
    if (new Date(frm.doc.date_of_visit) > new Date(frappe.datetime.get_today())) {
      frm.doc.date_of_visit = ''
      frm.set_value("date_of_visit", '')
      refresh_field('date_of_visit')
      frappe.throw(__("Date of visit can't be greater than today's date"))
    }
    if (frm.doc.date_of_visit && frm.doc.date_of_birth) {
      if (frm.doc.date_of_visit < frm.doc.date_of_birth) {
        frm.set_value('date_of_visit', '')
        return frappe.throw("Date of Visit shall not be before the <strong>Date of Birth</strong>")
      }
    }
  },
  state: function (frm) {
    apply_filter("district", "State", frm, frm.doc.state)
    frm.set_value("district", '')
    frm.set_value("ward", '')
    frm.set_value("name_of_the_settlement", '')
  },
  district: function (frm) {
    apply_filter("ward", "District", frm, frm.doc.district)
    frm.set_value("ward", '')
    frm.set_value("name_of_the_settlement", '')
  },
  ward: function (frm) {
    apply_filter("name_of_the_settlement", "block", frm, frm.doc.ward)
    frm.set_value("name_of_the_settlement", '')
  },
  state_of_origin: function (frm) {
    apply_filter("district_of_origin", "State", frm, frm.doc.state_of_origin)
    frm.set_value("district_of_origin", '')
    frm.set_value("block", '')
  },
  district_of_origin: function (frm) {
    apply_filter("block", "District", frm, frm.doc.district_of_origin)
    frm.set_value("block", '')
  },
  centre: function (frm) {
    console.log("Hello")
    frm.set_value('sub_centre', '')
    apply_filter("sub_centre", "centre", frm, frm.doc.centre)
  },
  current_occupation: async function (frm) {
    if (!frm.doc.current_occupation) return;
    if (frm.doc.current_occupation == 'Others') {
      apply_filter('occupational_category', 'name', frm, '', true)
      frm.set_value('occupational_category', '')

    } else {
      let doc = await get_occupation_category(frm)
      apply_filter('occupational_category', 'name', frm, ['=', doc.occupational_category])
      frm.set_value('occupational_category', doc.occupational_category)
      frm.set_value('new_occupation', '')
    }
  },
  occupational_category: function (frm) {
    if (frm.doc.occupational_category != 'Others') {
      frm.set_value('new_occupation_category', '')
    }
  },
  date_of_birth: function (frm) {
    let dob = frm.doc.date_of_birth;
    if (frm.doc.date_of_visit && frm.doc.date_of_birth) {
      if (frm.doc.date_of_visit && frm.doc.date_of_birth) {
        if (frm.doc.date_of_visit < frm.doc.date_of_birth) {
          frm.set_value("date_of_birth", '')
          return frappe.throw("Date of Visit shall not be before the <strong>Date of Birth</strong>")
        }
      }
    }
    if (new Date(dob) > new Date(frappe.datetime.get_today())) {
      frm.doc.date_of_birth = ''
      refresh_field('date_of_birth')
      frappe.throw(__("Date of birth can't be greater than today's date"))
    }
    if (dob) {
      let today = frappe.datetime.get_today();
      let birthDate = new Date(dob);
      let currentDate = new Date(today);
      let years = currentDate.getFullYear() - birthDate.getFullYear();
      let months = currentDate.getMonth() - birthDate.getMonth();
      if (months < 0 || (months === 0 && currentDate.getDate() < birthDate.getDate())) {
        years--;
        months = 12 - birthDate.getMonth() + currentDate.getMonth();
      } else {
        months = currentDate.getMonth() - birthDate.getMonth();
      }
      if (currentDate.getDate() < birthDate.getDate()) {
        months--;
      }
      let ageString = years > 0 ? years.toString() : '0';
      let completedAgeMonths = months <= 11 ? months : null;
      frm.doc.completed_age = ageString;
      frm.doc.completed_age_month = completedAgeMonths;
      frm.refresh_fields('completed_age', 'completed_age_month')
      // frm.set_value('completed_age', ageString);
      // frm.set_value('completed_age_month', completedAgeMonths);
      // frm.set_df_property('completed_age', 'read_only', 1);
      // frm.set_df_property('completed_age_month', 'read_only', 1);
    } else {
      // frm.set_df_property('completed_age', 'read_only', 0);
      // frm.set_df_property('completed_age_month', 'read_only', 0);
      // frm.set_value('completed_age', '0');
      // frm.set_value('completed_age_month', null);
    }
  },
  completed_age: function (frm) {
    if (frm.doc.date_of_birth !== frappe.datetime.get_today()) {
      // let dob = generateDOBFromAge(frm.doc?.completed_age, frm.doc?.completed_age_month)
      // frm.set_value("date_of_birth", dob)
    }
    // console.log("dob", dob)
  },
  completed_age_month: function (frm) {
    if (frm.doc.completed_age_month > 11) {
      frm.doc.completed_age_month = ''
      refresh_field('completed_age_month')
      frappe.throw(__("Completed age in month should be less than or equal to 11"))
    }
    if (frm.doc.date_of_birth !== frappe.datetime.get_today()) {
      let dob = generateDOBFromAge(frm.doc?.completed_age, frm.doc?.completed_age_month, frm.doc?.date_of_birth)
      console.log("generatedDOB", dob, frm.doc?.completed_age, frm.doc?.completed_age_month);

      frm.set_value("date_of_birth", dob)
    }
    // console.log("dob", dob)
  },
  are_you_a_person_with_disability_pwd: function (frm) {
    if (frm.doc.are_you_a_person_with_disability_pwd == "No") {
      frm.set_value("type_of_disability", '')
      frm.doc.proof_of_disability = '';
      frm.doc.what_is_the_extent_of_your_disability = '';
      frm.refresh_fields('what_is_the_extent_of_your_disability', 'proof_of_disability')

    }
  },
  what_is_the_extent_of_your_disability: function (frm) {
    if (frm.doc.what_is_the_extent_of_your_disability != "Above 40%") {
      frm.doc.proof_of_disability = [];
      frm.refresh_fields('proof_of_disability')
    }
  },
  marital_status: function (frm) {
    if (frm.doc.marital_status != "Married") {
      frm.set_value('spouses_name', '')
    }
  },
  social_vulnerable: function (frm) {
    if (frm.doc.social_vulnerable_category != "Yes") {
      frm.set_value('social_vulnerable_category', '')
      frm.set_value('other_social_vulnerable_category', '')
    }
  },
  social_vulnerable_category: function (frm) {
    if (frm.doc.social_vulnerable_category != "Others") {
      frm.set_value('other_social_vulnerable_category', '')
    }
  },
  source_of_information: function (frm) {
    if (frm.doc.source_of_information != "Others") {
      frm.set_value('new_source_of_information', '')
      frm.set_value('name_of_the_camp', '')
      frm.set_value('new_camp', '')
    }
  },
  name_of_the_camp: function (frm) {
    if (frm.doc.name_of_the_camp != "Others") {
      frm.set_value('new_camp', '')
    }
  },
  has_anyone_from_your_family_visisted_before: async function (frm) {
    if (frm.doc.has_anyone_from_your_family_visisted_before == "Yes") {
      frm.set_value('select_primary_member', '')
    } else {
      // await truncate_multiple_fields_value(frm, ['current_house_type', 'state', 'district', 'ward',
      //   'name_of_the_settlement', 'address_with_landmark', 'same_as_above', 'state_of_origin', 'district_of_origin', 'block'])
    }
  },
  select_primary_member: async function (frm) {
    const pm = frm.doc.select_primary_member;
    if (pm && !frm.doc.current_house_type && !frm.doc.state && !frm.doc.district && !frm.doc.ward) {
      let response = await get_document({ "contact_number": pm },
        ['name', "name_of_the_beneficiary", 'current_house_type', 'state', 'district', 'ward',
          'name_of_the_settlement', 'address_with_landmark', 'same_as_above', 'state_of_origin', 'district_of_origin', 'block']);
      const parent = response.message;
      frm.doc.current_house_type = parent.current_house_type;
      frm.doc.state = parent.state;
      frm.doc.district = parent.district;
      frm.doc.ward = parent.ward;
      frm.doc.name_of_the_settlement = parent.name_of_the_settlement;
      frm.doc.address_with_landmark = parent.address_with_landmark;
      frm.doc.same_as_above = parent.same_as_above;
      frm.doc.state_of_origin = parent.state_of_origin;
      frm.doc.district_of_origin = parent.district_of_origin;
      frm.doc.block = parent.block;
      frm.refresh_fields(['current_house_type', 'state', 'district', 'ward',
        'name_of_the_settlement', 'address_with_landmark', 'same_as_above', 'state_of_origin', 'district_of_origin', 'block'])
    } else {
      // if(frm.is_new()){
      //   await truncate_multiple_fields_value(frm, ['current_house_type', 'state', 'district', 'ward',
      //   'name_of_the_settlement', 'address_with_landmark', 'same_as_above', 'state_of_origin', 'district_of_origin', 'block'])

      // }
    }
  },
  current_house_type: function (frm) {
    if (frm.doc.current_house_type != "Others") {
      frm.set_value('add_house_type', '')
    }
  },
  same_as_above: async function (frm) {
    if (frm.doc.same_as_above == '1') {
      frm.doc.state_of_origin = frm.doc.state;
      frm.doc.district_of_origin = frm.doc.district;
      frm.doc.block = frm.doc.ward;
    } else {
      await truncate_multiple_fields_value(frm, ['state_of_origin', 'district_of_origin', 'block'])
    }
    refresh_field("state_of_origin")
    refresh_field("district_of_origin")
    refresh_field("block")
  }
});

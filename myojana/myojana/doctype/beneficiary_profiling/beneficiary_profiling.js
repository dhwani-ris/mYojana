// Copyright (c) 2023, suvaidyam and contributors
// // For license information, please see license.txt
// Calling APIs Common function
var is_primary_member_link_through_phone_number;
const indianPhoneNumberRegex = /^(?:(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9})$/;
let state_option = [];
let districts_option = [];
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
  let centre_meta = frm?.meta?.fields?.filter((e)=> e.fieldname == "centre")[0]
  if(centre_meta.hidden != 1){
    let centres = await callAPI({
      method: 'frappe.desk.search.search_link',
      freeze: false,
      args: {
        txt: '',
        doctype: "Centre",
        reference_doctype: "Beneficiary Profiling"
      },
    })
    if (centres?.length === 1) {
      frm.set_value("centre", centres[0].value)
    }
  }else{
    console.log("centre is hidden fields",)    
  }
  state_option = await callAPI({
    method: 'frappe.desk.search.search_link',
    freeze: false,
    args: {
      txt: '',
      doctype: "State",
      reference_doctype: "Beneficiary Profiling"
    },
  })
  districts_option = await callAPI({
    method: 'frappe.desk.search.search_link',
    freeze: false,
    args: {
      txt: '',
      doctype: "District",
      reference_doctype: "Beneficiary Profiling"
    },
    // freeze_message: __("Getting Districts"),
  })
  
  if (state_option?.length === 1) {
    frm.set_value("state", state_option[0].value)
  }
  if (districts_option?.length === 1) {
    frm.set_value("district", districts_option[0].value)
  }
}
async function get_myojana_setting() {
  let get_myojana_setting = await callAPI({
    method: 'myojana.apis.myojana_setting.get_myojana_setting',
    freeze: true,
    args: {
      fields: ['is_primary_member_link_through_phone_number']
    },
    // freeze_message: __("Getting Centres"),
  })
  return get_myojana_setting.is_primary_member_link_through_phone_number
}

frappe.ui.form.on("Beneficiary Profiling", {
  after_save: async function (frm) {
    if (!frm.is_new()) {
      frm.debounced_reload_doc()
    }
  },
  before_save: async function (frm) {
    if ((frm.doc.completed_age || frm.doc.completed_age_month) && !frm.doc?.date_of_birth) {
      await frm.set_value("date_of_birth", generateDOBFromAge(frm.doc?.completed_age, frm.doc?.completed_age_month, frm.doc?.date_of_birth))
    }
    // fill into hidden fields
    if (frm?.doc?.scheme_table && frm.doc?.scheme_table?.length) {
      for (_doc of frm?.doc?.scheme_table) {
        _doc.scheme = _doc.name_of_the_scheme;
        _doc.milestone = _doc.milestone_category;
      }
    }
    // check alternate mobile number digits
    if (is_primary_member_link_through_phone_number && (frm.doc.alternate_contact_number || frm.doc.contact_number)) {
      if (!indianPhoneNumberRegex.test(frm.doc.contact_number)) {
        frappe.throw(`Phone Number <b>${frm.doc.contact_number}</b> set in field contact_number is not valid.`)
      }
    }
    if (!indianPhoneNumberRegex.test(frm.doc.alternate_contact_number) && frm.doc.alternate_contact_number?.length > 1) {
      frappe.throw(`Phone Number <b>${frm.doc.alternate_contact_number}</b> set in field alternate_contact_number is not valid.`)
    }
  },
  async refresh(frm) {
    is_primary_member_link_through_phone_number = await get_myojana_setting()
    if (frm.is_new()) {
      console.log("new data")
      await autoSetOption(frm); // set options of centre and sub centre
      await frm.set_value('added_by', frappe.session.user);
      await frm.set_value('date_of_visit', frappe.datetime.get_today()); // SET TODAY DATE IN DATE OF VISIT

    } else {
      frm.add_custom_button(__('Add family members'), function () {
        frappe.route_options = {
          has_anyone_from_your_family_visisted_before: "Yes",
          select_primary_member: frm.doc.select_primary_member || frm.doc.contact_number,
        };
        frappe.new_doc('Beneficiary Profiling');
      }, __());

      let id_card_template = await frappe.db.get_single_value('mYojana Settings', 'id_card_template')
      if (id_card_template) {
        frm.add_custom_button(__('<svg fill="#01e93b" height="20px" width="20px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 308 308" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="XMLID_468_"> <path id="XMLID_469_" d="M227.904,176.981c-0.6-0.288-23.054-11.345-27.044-12.781c-1.629-0.585-3.374-1.156-5.23-1.156 c-3.032,0-5.579,1.511-7.563,4.479c-2.243,3.334-9.033,11.271-11.131,13.642c-0.274,0.313-0.648,0.687-0.872,0.687 c-0.201,0-3.676-1.431-4.728-1.888c-24.087-10.463-42.37-35.624-44.877-39.867c-0.358-0.61-0.373-0.887-0.376-0.887 c0.088-0.323,0.898-1.135,1.316-1.554c1.223-1.21,2.548-2.805,3.83-4.348c0.607-0.731,1.215-1.463,1.812-2.153 c1.86-2.164,2.688-3.844,3.648-5.79l0.503-1.011c2.344-4.657,0.342-8.587-0.305-9.856c-0.531-1.062-10.012-23.944-11.02-26.348 c-2.424-5.801-5.627-8.502-10.078-8.502c-0.413,0,0,0-1.732,0.073c-2.109,0.089-13.594,1.601-18.672,4.802 c-5.385,3.395-14.495,14.217-14.495,33.249c0,17.129,10.87,33.302,15.537,39.453c0.116,0.155,0.329,0.47,0.638,0.922 c17.873,26.102,40.154,45.446,62.741,54.469c21.745,8.686,32.042,9.69,37.896,9.69c0.001,0,0.001,0,0.001,0 c2.46,0,4.429-0.193,6.166-0.364l1.102-0.105c7.512-0.666,24.02-9.22,27.775-19.655c2.958-8.219,3.738-17.199,1.77-20.458 C233.168,179.508,230.845,178.393,227.904,176.981z"></path> <path id="XMLID_470_" d="M156.734,0C73.318,0,5.454,67.354,5.454,150.143c0,26.777,7.166,52.988,20.741,75.928L0.212,302.716 c-0.484,1.429-0.124,3.009,0.933,4.085C1.908,307.58,2.943,308,4,308c0.405,0,0.813-0.061,1.211-0.188l79.92-25.396 c21.87,11.685,46.588,17.853,71.604,17.853C240.143,300.27,308,232.923,308,150.143C308,67.354,240.143,0,156.734,0z M156.734,268.994c-23.539,0-46.338-6.797-65.936-19.657c-0.659-0.433-1.424-0.655-2.194-0.655c-0.407,0-0.815,0.062-1.212,0.188 l-40.035,12.726l12.924-38.129c0.418-1.234,0.209-2.595-0.561-3.647c-14.924-20.392-22.813-44.485-22.813-69.677 c0-65.543,53.754-118.867,119.826-118.867c66.064,0,119.812,53.324,119.812,118.867 C276.546,215.678,222.799,268.994,156.734,268.994z"></path> </g> </g></svg>'), async function () {
          let base64Image = await callAPI({
            method: 'myojana.apis.html_to_image.preview_doc_template',
            freeze: true,
            args: {
              doc:frm.doc.name,
              doctype:frm.doctype,
            },
            // freeze_message: __("getting template..."),
          });
          console.log('base64Image', base64Image);
          
          const imgSrc = `data:image/png;base64,${base64Image}`;
          
          // console.log('print_template', print_template);
          let d = new frappe.ui.Dialog({
            title: __("Confirmation"),
            fields: [
              {
                fieldtype: 'HTML',
                options: `<img src=${imgSrc} alt="Rendered Image" />`
              }
            ],
            primary_action_label: 'Send',
            primary_action: async function () {
              console.log('Send button clicked primary action');
              let id_doc = await callAPI({
                method: 'myojana.apis.whatsapp.send_id',
                freeze: true,
                args: {
                  doc:frm.doc.name
                },
                freeze_message: __("Sending Message ..."),
              });
              console.log('id_doc', id_doc);
              d.hide();
            }
          });

          d.set_secondary_action_label('Cancel');
          d.set_secondary_action(() => d.hide());
          d.show();
        }, __()).addClass('whatsapp-svg-button');

      }
      
      await apply_filter_on_id_document()

    }
    frm.fields_dict.date_of_visit.$input?.datepicker({ maxDate: new Date(frappe.datetime.get_today()) }); // restrict future date from date pickers
    extend_options_length(frm, ["centre", "sub_centre", "religion", "caste_category", "marital_status", "current_house_type", "source_of_information", "current_house_type", "state", "district", "occupational_category", "education", "education", "ward", "name_of_the_settlement", "proof_of_disability", "block", "state_of_origin", "current_occupation", "district_of_origin", "social_vulnerable_category", "name_of_the_camp"]);
    hide_advance_search(frm, ["state", "district", "ward", "state_of_origin", "religion", "caste_category", "marital_status", "district_of_origin", "block", "gender", "current_occupation", "social_vulnerable_category", "pwd_category", "family", "sub_centre", "centre", "source_of_information", "occupational_category", "current_house_type", "name_of_the_settlement", "name_of_the_camp", "proof_of_disability", "education"]);

    // APPLY FILTER IN CASE OF EDIT OF DATA
    await apply_filter('select_primary_member', 'name_of_head_of_family', frm, ['!=', frm.doc.name])
    frm.doc.state ? await apply_filter("district", "State", frm, frm.doc.state) : null;
    frm.doc.centre ? await apply_filter("sub_centre", "centre", frm, frm.doc.centre) : null;
    frm.doc.district ? await apply_filter("ward", "District", frm, frm.doc.district) : null;
    frm.doc.ward ? await apply_filter("name_of_the_settlement", "block", frm, frm.doc.ward) : null;
    frm.doc.state_of_origin ? await apply_filter("district_of_origin", "State", frm, frm.doc.state_of_origin) : null;
    frm.doc.district_of_origin ? await apply_filter("block", "District", frm, frm.doc.district_of_origin) : null;
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

    if (!frappe.user_roles.includes("Administrator")) {
      if (!frm.doc.__islocal) {
        frm.set_df_property('centre', 'read_only', 1);
        frm.set_df_property('sub_centre', 'read_only', 1);
      }
    }

    if (frappe.user_roles.includes("Sub-Centre") || frappe.user_roles.includes("CSC Member") || frappe.user_roles.includes("MIS executive")) {
      if (!frappe.user_roles.includes("Administrator")) {
        frm.set_df_property('scheme_table', 'cannot_delete_rows', true); // Hide delete button
        frm.set_df_property('scheme_table', 'cannot_delete_all_rows', true);
        frm.set_df_property('follow_up_table', 'cannot_delete_rows', true); // Hide delete button
        frm.set_df_property('follow_up_table', 'cannot_delete_all_rows', true);
      }
    }


    await render_scheme_datatable(frm) // render scheme_data_tables 

  },
  ////////////////////DATE VALIDATION/////////////////////////////////////////
  date_of_visit: async function (frm) {
    if (new Date(frm.doc.date_of_visit) > new Date(frappe.datetime.get_today())) {
      await frm.set_value("date_of_visit", '');
      await frappe.throw(__("Date of registration can't be greater than today's date"));
    }
    if (frm.doc.date_of_visit && frm.doc.date_of_birth) {
      if (frm.doc.date_of_visit < frm.doc.date_of_birth) {
        await frm.set_value('date_of_visit', '');
        return frappe.throw("Date of registration shall not be before the <strong>Date of Birth</strong>")
      }
    }
  },
  contact_number: function (frm) {
    if (is_primary_member_link_through_phone_number && (!indianPhoneNumberRegex.test(frm.doc.contact_number) && frm.doc.contact_number.length > 9)) {
      console.log("frm.doc.contact_number.length", frm.doc.contact_number.length);
      frappe.throw(`Phone Number <b>${frm.doc.contact_number}</b> set in field contact_number is not valid.`)
    }
  },
  state: async function (frm) {
    await apply_filter("district", "state", frm, frm.doc.state);
    districts_option && districts_option.length > 1 ? await frm.set_value("district", '') : null;
    await frm.set_value("ward", '');
    await frm.set_value("name_of_the_settlement", '');
  },
  district: async function (frm) {
    await apply_filter("ward", "district", frm, frm.doc.district);
    await frm.set_value("ward", '');
    await frm.set_value("name_of_the_settlement", '');
  },
  ward: async function (frm) {
    await apply_filter("name_of_the_settlement", "block", frm, frm.doc.ward);
    await frm.set_value("name_of_the_settlement", '');
  },
  state_of_origin: async function (frm) {
    await apply_filter("district_of_origin", "State", frm, frm.doc.state_of_origin);
    await frm.set_value("district_of_origin", '');
    await frm.set_value("block", '');
  },
  district_of_origin: async function (frm) {
    await apply_filter("block", "District", frm, frm.doc.district_of_origin);
    await frm.set_value("block", '');
  },
  centre: async function (frm) {
    await frm.set_value('sub_centre', '');
    await apply_filter("sub_centre", "centre", frm, frm.doc.centre);
  },
  current_occupation: async function (frm) {
    if (!frm.doc.current_occupation) return;
    if (frm.doc.current_occupation == 'Others') {
      await apply_filter('occupational_category', 'name', frm, '', true);
      await frm.set_value('occupational_category', '');
    } else {
      let doc = await get_occupation_category(frm);
      await apply_filter('occupational_category', 'name', frm, ['=', doc.occupational_category]);
      await frm.set_value('occupational_category', doc.occupational_category);
      await frm.set_value('new_occupation', '');
    }
  },
  occupational_category: async function (frm) {
    frm.doc.occupational_category != 'Others' ? await frm.set_value('new_occupation_category', '') : null;
  },
  date_of_birth: async function (frm) {
    let dob = frm.doc.date_of_birth;
    if (new Date(dob) > new Date(frappe.datetime.get_today())) {
      await frm.set_value("date_of_birth", '');
      return frappe.throw(__("Date of birth can't be greater than today's date"));
    }
    if (frm.doc.date_of_visit && frm.doc.date_of_birth) {
      if (frm.doc.date_of_visit && frm.doc.date_of_birth) {
        if (frm.doc.date_of_visit < frm.doc.date_of_birth) {
          await frm.set_value("date_of_birth", '');
          return frappe.throw("Date of birth cannot be greater than the date of registration");
        }
      }
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
      if(frm.doc.completed_age != ageString){
        await frm.set_value(
          'completed_age', ageString,
         );
      }
      if(frm.doc.completed_age_month != completedAgeMonths){
        await frm.set_value(
          'completed_age_month', completedAgeMonths,
         );
      }
      // await frm.set_value({
      //   'completed_age': ageString,
      //   'completed_age_month': completedAgeMonths
      // });
    }
  },
  completed_age: function (frm) {

  },
  completed_age_month: async function (frm) {
    if (frm.doc.completed_age_month > 11) {
      await frm.set_value("completed_age_month", '');
      await frappe.throw(__("Completed age in month should be less than or equal to 11"));
    }
    let dob = generateDOBFromAge(frm.doc?.completed_age, frm.doc?.completed_age_month, frm.doc?.date_of_birth)
    // console.log("///////////////////",  frm.doc?.date_of_birth , dob)
    if (new Date(frm.doc.date_of_birth) !== new Date(dob)) {
      console.log("generatedDOB", dob, frm.doc?.completed_age, frm.doc?.completed_age_month);
      // frm.set_value("date_of_birth", dob)
    }
  },
  are_you_a_person_with_disability_pwd: async function (frm) {
    frm.doc.are_you_a_person_with_disability_pwd == "No" ? await frm.set_value({
      "type_of_disability": '',
      "proof_of_disability": '',
      "what_is_the_extent_of_your_disability": ''
    }) : null;
  },
  what_is_the_extent_of_your_disability: async function (frm) {
    frm.doc.what_is_the_extent_of_your_disability != "Above 40%" ? await frm.set_value('proof_of_disability', []) : null;
  },
  marital_status: async function (frm) {
    frm.doc.marital_status != "Married" ? await frm.set_value("spouses_name", '') : null;
  },
  social_vulnerable: async function (frm) {
    frm.doc.social_vulnerable != "Yes" ? await frm.set_value({
      "social_vulnerable_category": '',
      'other_social_vulnerable_category': ''
    }) : null;

  },
  social_vulnerable_category: async function (frm) {
    frm.doc.social_vulnerable_category != "Others" ? await frm.set_value('other_social_vulnerable_category', '') : null;
  },
  source_of_information: async function (frm) {
    frm.doc.source_of_information != "Others" ? await frm.set_value({
      'new_source_of_information': '',
      'name_of_the_camp': '',
      'new_camp': ''
    }) : null;
  },
  name_of_the_camp: async function (frm) {
    frm.doc.name_of_the_camp != "Others" ? await frm.set_value('new_camp', '') : null;
  },
  has_anyone_from_your_family_visisted_before: async function (frm) {
    if (frm.doc.has_anyone_from_your_family_visisted_before == "Yes") {
      await frm.set_value('select_primary_member', '')
    } else {
      if (frm.is_new()) {
        await truncate_multiple_fields_value(frm, ['current_house_type', 'state', 'district', 'ward',
          'name_of_the_settlement', 'address_with_landmark', 'same_as_above', 'state_of_origin', 'district_of_origin', 'block'])
      }
    }
  },
  select_primary_member: async function (frm) {
    const pm = frm.doc.select_primary_member;
    if (pm && frm.is_new()) {
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
    }
  },
  current_house_type: async function (frm) {
    frm.doc.current_house_type != "Others" ? await frm.set_value('add_house_type', '') : null;
  },
  same_as_above: async function (frm) {
    frm.doc.same_as_above == '1' ? await frm.set_value({
      'state_of_origin': frm.doc.state,
      'district_of_origin': frm.doc.district,
      'block': frm.doc.ward
    }) : await frm.set_value({
      'state_of_origin': '',
      'district_of_origin': '',
      'block': ''
    });
  },
});

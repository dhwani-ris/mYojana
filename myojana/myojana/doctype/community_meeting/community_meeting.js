// Copyright (c) 2024, suvaidyam and contributors
// For license information, please see license.txt
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
const get_ordered_list = async (doctype, optionsToSort) => {
    let list = await callAPI({
      method: 'frappe.desk.search.search_link',
      freeze: true,
      args: {
        doctype: doctype,
        page_length: 1000,
        txt: ''
      },
      freeze_message: __("Getting list ..."),
    })
    if (optionsToSort) {
      let reOrderedList = [];
      optionsToSort.forEach(async (option) => {
        const requiredOption = await list.find(item => item.value === option);
        reOrderedList.push(requiredOption);
      });
      const exceptionList = await list.filter(item => !optionsToSort.some(item2 => item.value === item2 || item.value === "Others"));
      exceptionList.forEach(async (option) => {
        reOrderedList = [...reOrderedList, option];
      })
      list = reOrderedList;
      return list;
      // const otherOption = list.find(item => item.value === 'Others');
      // if (otherOption) {
      //   list = list.filter(item => item.value !== 'Others');
      //   list.push(otherOption);
      // }
    }
    return list
  
  }
frappe.ui.form.on("Community meeting", {
	async refresh(frm) {
        frm.set_df_property('current_house_type', 'options', await get_ordered_list("House Types", ["Own", "Rented", "Relative's home", "Government quarter"]));
	},
    single_window:function(frm){
        frm.fields_dict['help_desk'].get_query = function (doc) {
            return {
              filters: {
                'single_window': frm.doc.single_window,
              },
              page_length: 1000
            };
          }
    },
    add_to_beneficary:function(frm){
        frappe.route_options = {
            lead: frm.doc.name,
            // date_of_visit: frm.doc.date_of_visit,
            // gender: frm.doc.gender,
            // completed_age: frm.doc.completed_age,
            // name_of_the_beneficiary: frm.doc.name_of_the_beneficiary,
            // contact_number: frm.doc.contact_number,
            // caste_category: frm.doc.caste_category,
            // education: frm.doc.education,
            // current_occupation: frm.doc.current_occupation,
            // marital_status: frm.doc.marital_status,
            // single_window: frm.doc.single_window,
            // fathers_name: frm.doc.fathers_name,
            // mothers_name: frm.doc.mothers_name,
            // source_of_information: frm.doc.source_of_information,
            // state_of_origin: frm.doc.state_of_origin,
            // current_house_type: frm.doc.current_house_type,
            // address: frm.doc.address,
            // name_of_scheme: frm.doc.name_of_scheme,
        };
        
        // Open a new form for the desired DocType
        frappe.new_doc('Beneficiary Profiling');
        
    },
    views_beneficary:function(frm){
        // Redirect to the form view of the specified Beneficiary Profiling document
        frappe.set_route('Form', 'Beneficiary Profiling', frm.doc.beneficiary);

    }
});

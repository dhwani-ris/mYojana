// order list in select fields
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
      optionsToSort?.forEach(async (option) => {
        const requiredOption = await list?.find(item => item.value === option);
        reOrderedList.push(requiredOption);
      });
      const exceptionList = await list?.filter(item => !optionsToSort.some(item2 => item.value === item2));
      exceptionList?.forEach(async (option) => {
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
  const get_occupation_category = async (frm) => {
    let list = await callAPI({
      method: 'frappe.client.get',
      freeze: true,
      args: {
        doctype: 'Occupation',
        name: frm.doc.current_occupation
      },
      freeze_message: __("Getting schemes..."),
    })
    return list;
  }
  
  const get_document = async (filter, fields) => {
    return await frappe.call({
      method: 'frappe.client.get_value',
      args: {
        'doctype': 'Beneficiary Profiling',
        'filters': filter,
        'fieldname': fields
      },
      callback: function (response) {
        // Handle the response
        if (!response.exc) {
          var doc = response.message;
          return doc;
        } else {
          console.error('Error fetching document:', response.exc);
        }
      }
    });
  
  }

// generate date of birth
function generateDOBFromAge(ageInYears = 0, ageInMonths = 0 , date_of_birth) {
  console.log("date_of_birth", date_of_birth)
  if(date_of_birth){
    split_value = date_of_birth.split('-')
    var date = split_value[2]
  }
  console.log("dov in fun", date)
  // date of birth of tommorow is not selected in calander
  let currentDate = new Date();
  let startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), date ? date:1);
  let birthYear = startOfMonth.getFullYear() - ageInYears;
  let birthMonth = startOfMonth.getMonth() - ageInMonths;
  if (birthMonth < 0) {
    birthYear--;
    birthMonth = 12 + birthMonth;
  }
  // Create the Date object for the generated date of birth
  let generatedDOB = new Date(birthYear, birthMonth, startOfMonth.getDate());
  return generatedDOB;
}

// const validate_date_of_application = async (frm) => {
//   if(frm?.doc?.scheme_table){
//     for (row of frm?.doc?.scheme_table) {
//       if (row.application_submitted == "Yes" || row.application_submitted == "Completed") {
//         if (!row.date_of_application) {
//           frappe.throw(`Mandatory fields required in table Scheme Table, Row ${row.idx} 
//           </br> </br> <ul><li>Date of application</li></ul>`)
//         }
//       }
  
//     }
//   }

// }
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
    // freeze_message: __("Getting list ..."),
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
    // freeze_message: __("Getting schemes..."),
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
function generateDOBFromAge(ageInYears = 0, ageInMonths = 0, date_of_birth) {
  let date = 1;
  if (date_of_birth) {
    const split_value = date_of_birth.split('-');
    date = parseInt(split_value[2], 10);
  }
  let currentDate = new Date();
  let startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), date);
  let birthYear = startOfMonth.getFullYear() - ageInYears;
  let birthMonth = startOfMonth.getMonth() - ageInMonths;
  if (birthMonth < 0) {
    birthYear--;
    birthMonth += 11;
  }
  let generatedDOB = new Date(birthYear, birthMonth, date);
  return generatedDOB;
}
// function generateDOBFromAge(ageInYears = 0, ageInMonths = 0 , date_of_birth) {
//   if(date_of_birth){
//     split_value = date_of_birth.split('-')
//     var date = split_value[2]
//   }
//   console.log("dov in fun", date)
//   // date of birth of tommorow is not selected in calander
//   let currentDate = new Date();
//   let startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), date ? date:1);
//   let birthYear = startOfMonth.getFullYear() - ageInYears;
//   let birthMonth = startOfMonth.getMonth() - ageInMonths;
//   if (birthMonth < 0) {
//     birthYear--;
//     birthMonth = 12 + birthMonth;
//   }
//   // Create the Date object for the generated date of birth
//   let generatedDOB = new Date(birthYear, birthMonth, startOfMonth.getDate());
//   console.log("date_of_birth////////", generatedDOB)
//   return generatedDOB;
// }
// get scheme lists
const get_scheme_list = async (frm) => {
  let list = await callAPI({
    method: 'myojana.api.execute',
    freeze: true,
    args: {
      name: frm.doc.name
    },
    // freeze_message: __("Getting schemes..."),
  })
  scheme_list = list.sort((a, b) => b.matching_rules_per - a.matching_rules_per);
  return scheme_list
}

async function render_scheme_datatable(frm) {

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
      scheme_name: scheme?.name_of_the_scheme,
      name: `<a href="/app/scheme/${scheme?.name}">${scheme.name_of_the_scheme}</a>`,
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
}
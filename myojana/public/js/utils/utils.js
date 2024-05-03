
// This Function Hide Advance search option in Link Fields
const hide_advance_search=(frm, list)=> {
    for (item of list) {
      frm.set_df_property(item, 'only_select', true);
    }
};
//  This Function extend limit of Link field in dropdowns
const extend_options_length=(frm, fields) => {
    fields?.forEach((field) => {
      frm.set_query(field, () => {
        return { page_length: 1000 };
      });
    })
};

// COMMON FUNCTON FOR FILTER OF LINK FIELD
// this function apply filter
function apply_filter(field_name, filter_on, frm, filter_value, withoutFilter = false) {
  frm.fields_dict[field_name].get_query = () => {
    if (withoutFilter) {
      return {
        filters: {},
        page_length: 1000
      };
    }
    return {
      filters: {
        [filter_on]: filter_value || frm.doc[filter_on] || `please select ${filter_on}`,
      },
      page_length: 1000
    };
  }
};
//  This Fields delete fields values
async function truncate_multiple_fields_value(_frm, fields) {
  for (field of fields) {
    _frm.set_value(field, '')
  }
}
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

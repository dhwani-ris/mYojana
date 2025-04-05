// Copyright (c) 2023, suvaidyam and contributors
// For license information, please see license.txt
const apply_filter = (frm , field_name , filter_on , filter_value)=>{
    frm.fields_dict[field_name].get_query = function (doc) {
        return {
          filters: {
            [filter_on]: filter_value,
          },
          page_length: 1000
        };
      }
}
function defult_filter(field_name, filter_on, frm) {
    frm.fields_dict[field_name].get_query = function (doc) {
      return {
        filters: {
          [filter_on]: frm.doc.filter_on || `please select ${filter_on}`,
        },
      };
    }
  };
  function hide_advance_search(frm, list) {
    for (item of list) {
      frm.set_df_property(item, 'only_select', true);
    }
  };
frappe.ui.form.on("Village", {
	refresh(frm) {
        frm.doc.state ? apply_filter(frm ,"district", "state", frm.doc.state) : defult_filter('district', "state", frm);
        frm.doc.district ? apply_filter(frm ,"block", "district", frm.doc.district) : defult_filter('block', "district", frm);
	},
    state:function(frm){
        apply_filter(frm , 'district', "state", frm.doc.state)
    },
    district:function(frm){
        apply_filter(frm , 'block', "district", frm.doc.district)
    }
});

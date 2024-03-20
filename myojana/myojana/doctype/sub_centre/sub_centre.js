// Copyright (c) 2023, suvaidyam and contributors
// For license information, please see license.txt

frappe.ui.form.on("Sub Centre", {
  refresh(frm) {
    frm.fields_dict["centre"].get_query = function (doc) {
      return {
        filters: {
          State: "Please Select State",
        },
      };
    }
  },
  state: function (frm) {
    frm.fields_dict["centre"].get_query = function (doc) {
      return {
        filters: {
          State: frm.doc.state,
        },
        page_length: 1000
      };
    }
  }
});
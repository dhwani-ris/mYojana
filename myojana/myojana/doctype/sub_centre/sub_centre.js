// Copyright (c) 2023, suvaidyam and contributors
// For license information, please see license.txt

frappe.ui.form.on("Sub Centre", {

  refresh(frm) {
    apply_filter("centre", "State", frm, frm.doc.state);
    extend_options_length(frm, ['state','centre']);
    hide_advance_search(frm, ['state','centre'])
  },
  state: function (frm) {
    apply_filter("centre", "State", frm, frm.doc.state);
  }
});

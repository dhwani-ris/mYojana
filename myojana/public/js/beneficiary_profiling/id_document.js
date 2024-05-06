const indianVoterIdRegex = /^[A-Z]{3}[0-9]{7}$/;
const indianAadharRegex = /^\d{4}\s\d{4}\s\d{4}$/;


const apply_filter_on_id_document = async () => {
  //  APPLY Filter in ID DOCUMENT
  var child_table = _frm.fields_dict['id_table_list'].grid;
  if (child_table) {
    try {
      child_table.get_field('which_of_the_following_id_documents_do_you_have').get_query = function () {
        return {
          filters: [
            ['ID Document', 'document', 'NOT IN', cur_frm.doc.id_table_list.map(function (item) {
              return item.which_of_the_following_id_documents_do_you_have;
            })]
          ]
        };
      };
    } catch (error) {
      console.error(error)
    }
  }
}
// ********************* ID documents CHILD Table *********************
frappe.ui.form.on('ID Document Child', {
  form_render: async function (frm, cdt, cdn) {

  },
  id_table_list_add: async function (frm, cdt, cdn) {
    apply_filter_on_id_document()
  },
  enter_id_number: async function (frm, cdt, cdn) {
    let row = frappe.get_doc(cdt, cdn);
    console.log("row.enter_id_number => ", row.which_of_the_following_id_documents_do_you_have);
    console.log("row.enter_id_number => ", row.enter_id_number);
    if (!indianVoterIdRegex.test(row.enter_id_number) && row.which_of_the_following_id_documents_do_you_have == "Voter ID card" && row.enter_id_number.length > 9) {
      frappe.throw(`Voter ID Number <b>${row.enter_id_number}</b> set in field enter_id_number is not valid.`)
    }
    if (!indianAadharRegex.test(row.enter_id_number) && row.which_of_the_following_id_documents_do_you_have == "Aadhar card" && row.enter_id_number.length > 11) {
      frappe.throw(`Phone Number <b>${row.enter_id_number}</b> set in field enter_id_number is not valid.`)
    }
  },
})

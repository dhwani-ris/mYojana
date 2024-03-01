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
// ********************* ID documents CHILD Table***********************
frappe.ui.form.on('ID Document Child', {
    form_render: async function (frm, cdt, cdn) {
  
    },
    id_table_list_add: async function (frm, cdt, cdn) {
      console.log("hello everyone")
      apply_filter_on_id_document()
    }
  })
  
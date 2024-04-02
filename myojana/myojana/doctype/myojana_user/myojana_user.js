// Copyright (c) 2023, suvaidyam and contributors
// For license information, please see license.txt
let d = new frappe.ui.Dialog({
    title: 'Add User Permission',
    fields: [
        {
            "fieldname": "select_doctype",
            "fieldtype": "Autocomplete",
            "label": "Select Doctype",
            "options": "State\nDistrict\nBlock\nCentre\nSub Centre"
        },
        {
            "depends_on": "eval:doc.select_doctype==\"State\"",
            "fieldname": "select_districts",
            "fieldtype": "Table MultiSelect",
            "label": "Select States",
            "options": "State Child"
        },
        {
            "depends_on": "eval:doc.select_doctype==\"District\"",
            "fieldname": "select_districts",
            "fieldtype": "Table MultiSelect",
            "label": "Select Districts",
            "options": "District Child"
        },
        {
            "depends_on": "eval:doc.select_doctype==\"Block\"",
            "fieldname": "select_blocks",
            "fieldtype": "Table MultiSelect",
            "label": "Select Blocks",
            "options": "Block Child"
        },
        {
            "depends_on": "eval:doc.select_doctype==\"Centre\"",
            "fieldname": "select_centres",
            "fieldtype": "Table MultiSelect",
            "label": "Select Centres",
            "options": "Centre Child"
        },
        {
            "depends_on": "eval:doc.select_doctype==\"Sub Centre\"",
            "fieldname": "select_sub_centres",
            "fieldtype": "Table MultiSelect",
            "label": "Select Sub Centres",
            "options": "Sub Centre Child"
        }
    ],
    primary_action_label: 'Submit',
    primary_action(values) {
        // Log the selected values
        console.log(values);
        let doctype = values.select_doctype;
        let selected_keys;
        if(values.select_doctype =="State"){
            selected_keys= values.select_states;
            console.log(selected_keys)
            loop_values(selected_keys , doctype)
        }
        
        // Hide the dialog
        d.hide();
    }
});
//  datatables
let element = document.querySelector('#datatable');
const render_tables = async(frm)=>{
    let list = await get_permission({'user':frm.doc.name})
    console.log(list)
    let tables = `<table class="table">
    <thead>
      <tr>
        <th scope="col">#</th>
        <th scope="col">Doctype</th>
        <th scope="col">Values</th>
      </tr>
    </thead>
    <tbody>
    `
    for(let i = 0; i < list?.values.length; i++){
        tables = tables + `
        <tr>
        <th scope="row">${i+1}</th>
        <td>${list?.values[i][i]}</td>
        <td>${list?.values[i][i +1]}</td>
      </tr>
        `
    }
    tables = tables + `</tbody>
    </table>`
    document.getElementById('datatable').innerHTML = tables
}

const loop_values =(selected_keys, doctype)=>{
    for(let i = 0; i < selected_keys.length; i++){
        key= doctype.toLowerCase()
        console.log(doctype, selected_keys[i].state)
        set_permission(doctype, selected_keys[i].state)
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
// get scheme lists
const set_permission = async (doctype , values) => {
    let list = await callAPI({
      method: 'frappe.desk.form.save.savedocs',
      freeze: true,
      args: {
        doc:{
            "docstatus":0,
            "doctype":"User Permission",
            // "__islocal":1,"__unsaved":1,
            "owner": frappe.session.user,
            "is_default":0,
            "apply_to_all_doctypes":1,
            "hide_descendants":0,
            "user":frappe.session.user,
            "allow":doctype,
            "for_value":values
        },
        action:"Save",
      },
      
      freeze_message: __("Saving Data"),
    })
    return list
  }
//   get permissions
const get_permission = async (filter={}) => {
    let list = await callAPI({
      method: 'frappe.desk.reportview.get',
      freeze: true,
      args: {
        doctype:"User Permission",
        fields:["allow", "for_value",],
        filters: filter,
        view:"List",
        order_by: "",
        group_by:'',
      },
      
      freeze_message: __("Getting Permissions"),
    })
    return list
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
function apply_filter(field_name, filter_on, frm, filter_value) {
    frm.fields_dict[field_name].get_query = function (doc) {
        return {
            filters: {
                [filter_on]: filter_value,
            },
            page_length: 1000
        };
    }
};
function extend_options_length(frm, fields) {
    fields.forEach((field) => {
        frm.set_query(field, () => {
            return { page_length: 1000 };
        });
    })
};
function hide_advance_search(frm, list) {
    for (item of list) {
        frm.set_df_property(item, 'only_select', true);
    }
};
frappe.ui.form.on("Myojana User", {
    refresh(frm) {
        frm.doc.password = frm.doc.confirm_password
        frm.doc.state ? apply_filter("centre", "state", frm, frm.doc.state) : defult_filter('centre', "state", frm);
        // frm.doc.centre ? apply_filter("sub_centre", "centre", frm, frm.doc.centre) : defult_filter('sub_centre', "centre", frm);
        extend_options_length(frm, ["state"])
        hide_advance_search(frm, ["role_profile", "state", "centre"])

        
        render_tables(frm)

    },
    role_profile: function (frm) {

    },
    state: function (frm) {
        if (frm.doc.state) {
            apply_filter("centre", "state", frm, frm.doc.state)
        } else {
            defult_filter('centre', "state", frm)
        }
    },
    add_permission: function(frm){
        d.show();
    }
    // centre: function (frm) {
    //     if (frm.doc.centre) {
    //         apply_filter("sub_centre", "centre", frm, frm.doc.centre)
    //     } else {
    //         defult_filter('sub_centre', "centre", frm);
    //     }
    // }
});

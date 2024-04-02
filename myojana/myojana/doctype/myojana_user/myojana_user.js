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
            "fieldname": "select_states",
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
        switch (doctype) {
            case "State":
                selected_keys= values.select_states;
                console.log(selected_keys)
                loop_values(selected_keys , doctype , cur_frm, 'state')
                break;
            case "District":
                selected_keys= values.select_districts;
                console.log(selected_keys)
                loop_values(selected_keys , doctype , cur_frm, 'district')
                break;
            case "Block":
                selected_keys= values.select_blocks;
                console.log(selected_keys)
                loop_values(selected_keys , doctype , cur_frm, 'block')
                break;
            case "Centre":
                selected_keys= values.select_centres;
                console.log(selected_keys)
                loop_values(selected_keys , doctype , cur_frm, 'centre')
                break;
            case "Sub Centre":
                selected_keys= values.select_sub_centres;
                console.log(selected_keys)
                loop_values(selected_keys , doctype , cur_frm, 'sub_centre')
                break
            default:
                break;
        }
        
        // Hide the dialog
        d.hide();
    }
});
//  datatables
let element = document.querySelector('#datatable');
const render_tables = async(frm)=>{
    let list = await get_permission(frm.doc.name)
    console.log(list)
    let tables = `<table class="table">
    <thead>
      <tr>
        <th scope="col">#</th>
        <th scope="col">Doctype</th>
        <th scope="col">Values</th>
        <th scope="col">Values</th>
      </tr>
    </thead>
    <tbody>
    `
    for(let i = 0; i < list?.length; i++){
        tables = tables + `
        <tr>
        <th scope="row">${i+1}</th>
        <td>${list?.[i].allow}</td>
        <td>${list?.[i].name_value}</td>
        <td class="text-danger"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>  <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/></svg></td>
      </tr>
        `
    }
    tables = tables + `</tbody>
    </table>`
    document.getElementById('datatable').innerHTML = tables
}

const loop_values =(selected_keys, doctype, frm ,key)=>{
    for(let i = 0; i < selected_keys.length; i++){
        console.log(doctype, selected_keys[i][key])
        set_permission(doctype, selected_keys[i][key] , frm)
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
const set_permission = async (doctype , values, frm) => {
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
            "user":frm.doc.name,
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
const get_permission = async (user) => {
    let list = await callAPI({
      method: 'myojana.api.get_user_permission',
      freeze: true,
      args: {
        doctype:"User Permission",
        user: user,
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

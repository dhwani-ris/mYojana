// Copyright (c) 2023, suvaidyam and contributors
// For license information, please see license.txt
var common_operators = ["=", "!="]
var field_types = {
    "Date": [...common_operators, ">", "<", ">=", "<="],
    "Int": [...common_operators, ">", "<", ">=", "<="],
    "Link": [...common_operators]
}
function evaluateExpression(input, expression) {
    if (!(/^[a-zA-Z0-9\s()+\-/*%&|=!<>]*$/.test(expression))) {
        return 'Invalid expression'
    }
    // expression = expression.toLowerCase();
    expression = expression.replace(/and/g, '&&').replace(/or/g, '||');
    expression = expression.replace(/AND/g, '&&').replace(/OR/g, '||');
    for (let key in input) {
        expression = expression.replace(new RegExp(key, 'g'), input[key]);
    }
    try {
        return eval(expression);
    } catch (err) {
        return err.message;
    }
}
function generateQueryString(rows, expression) {

    for (let row of rows) {
        if (['IN', 'NOT IN'].includes(row.operator)) {
            let val = row.data?.split(',').map(e => `'${e}'`).join(',');
            expression = expression.replace(new RegExp(row.code, 'g'), `${row.rule_field} ${row.operator} (${val})`)
        } else {
            expression = expression.replace(new RegExp(row.code, 'g'), `${row.rule_field} ${row.operator} '${row.data}'`)
        }
    }
    return 'select * from `tabBeneficiary Profiling` where ' + expression
}
var field_list = []
function get_field_list(frm) {
    frappe.call({
        method: "sipms.rule_engine.apis.get_meta_api.get_field_lists",
        args: {
            doctype_name: "Beneficiary Profiling",
            field_types: Object.keys(field_types)
        },
        callback: function (response) {
            // Handle the response
            if (response.message) {
                field_list = response.message
                frm.fields_dict.field_table.grid.update_docfield_property("rule_field", "options", response.message);
                console.log(response.message);
            } else {
                // console.error("API call failed");
            }
        }
    });

}
function get_Link_list(doctype_name) {
    return new Promise((resolve, reject) => {
        frappe.call({
            method: "frappe.desk.search.search_link",
            args: {
                doctype: doctype_name,
                txt: "",
                page_length: 10000
            },
            callback: async function (response) {
                let data = response?.results || response?.message
                if (data) {
                    resolve(data);
                }
            }
        });
    })
}
frappe.ui.form.on("Rule Engine", {
    refresh(frm) {

    },
    condition: (frm) => {
        let el = document.querySelector("[data-fieldname='condition'] p")
        let rows = frm.get_field('field_table')?.grid?.data;
        if (rows && rows?.length) {
            let input = {};
            for (let row of rows) {
                input[row.code] = true
            }
            let eval = evaluateExpression(input, frm.doc.condition);
            if (typeof eval == 'string') {
                // el.style.color = 'red !important';
                el.setAttribute("style", "color: red !important");
                el.textContent = eval;
            } else {
                el.setAttribute("style", "color: green !important");
                el.textContent = generateQueryString(rows, frm.doc.condition);
            }
        } else if (frm.doc.condition) {
            el.setAttribute("style", "color: red !important");
            el.textContent = 'Invalid expression.';
        } else {
            el.setAttribute("style", "");
            el.textContent = '';
        }
    }
});
// CHILD TABLE
frappe.ui.form.on('Rule Engine Child', {
    refresh(frm) {
    },
    field_table_add(frm, cdt, cdn) {
        let initial_code = 64
        let row = frappe.get_doc(cdt, cdn);
        if (row.idx <= 26) {
            row.code = (String.fromCharCode(initial_code + row.idx))
        } else {
            row.code = (String.fromCharCode(initial_code + (row.idx - 26)) + String.fromCharCode(initial_code + (row.idx - 26)))
        }

        get_field_list(frm)
        console.log("aa", row)
        // frm.fields_dict.field_table.grid.toggle_reqd("data", 1)
        // console.log(frm.fields_dict.field_table.grid.get_field('rule_field'))
        // frm.fields_dict.field_table.section.fields_dict.field_table.grid.df.fields_dict.rule_field.toggle(false)
        // frm.fields_dict.field_table.grid.df.fields_dict.rule_field.toggle(false);
        // frm.fields_dict.field_table.grid.get_field('rule_field').df.hidden = true;


        // frm.fields_dict.field_table.grid.df.read_only = 1
        // frm.fields_dict.field_table.row.data.df.data = 'Date';
        // console.log(frm.fields_dict.field_table.section.fields_dict.field_table)


    },
    rule_field: async function (frm, cdt, cdn) {
        let row = frappe.get_doc(cdt, cdn);
        row.type = field_list?.find(f => f.value == row.rule_field)?.type;
        frm.fields_dict.field_table.grid.update_docfield_property("operator", "options", field_types[row.type]);

        if (row.type == "Link") {
            let options = field_list.find(f => f.value == row.rule_field)?.options;
            console.log("rule_field", row.type, options);
            let link_data = await get_Link_list(options)
            console.log("link_data:", link_data);
            frm.fields_dict.field_table.grid.update_docfield_property("select", "options", link_data);
        }
        frm.fields_dict.field_table.grid.refresh();
        var cur_grid = frm.get_field('field_table').grid;
        var cur_doc = locals[cdt][cdn];
        var cur_row = cur_grid.get_row(cur_doc.name);
        cur_row.toggle_view();
    },
    date: function (frm, cdt, cdn) {
        let row = frappe.get_doc(cdt, cdn);
        row.data = row.date
        frm.fields_dict.field_table.grid.refresh();
    },
    select: function (frm, cdt, cdn) {
        let row = frappe.get_doc(cdt, cdn);
        row.data = row.select
        frm.fields_dict.field_table.grid.refresh();
    },
    value: function (frm, cdt, cdn) {
        let row = frappe.get_doc(cdt, cdn);
        row.data = row.value
        frm.fields_dict.field_table.grid.refresh();
    }
})

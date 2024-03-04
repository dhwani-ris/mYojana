// Copyright (c) 2023, suvaidyam and contributors
// For license information, please see license.txt
var common_operators = ["=", "!="]
var field_types = {
    "Date": [...common_operators, ">", "<", ">=", "<="],
    "Int": [...common_operators, ">", "<", ">=", "<="],
    "Link": [...common_operators],
    "Select": [...common_operators],
    "Currency": [...common_operators, ">", "<", ">=", "<="]
}
// CHILD TABLE
var child_table_field = 'rules'
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
function generateQueryString(rows) {
    console.log("generateQueryString[called]", rows);
    let obj = {};
    for (let row of rows) {
        if (row.rule_field && row.operator && row.data) {
            let val = ['IN', 'NOT IN'].includes(row.operator) ? row.data?.split(',').map(e => `'${e}'`).join(',') : row.data;
            if (obj[row.group]) {
                obj[row.group].push(`${row.rule_field} ${row.operator} ${val}`)
            } else {
                obj[row.group] = [`${row.rule_field} ${row.operator} ${val}`]
            }
        }
    }
    let cond = Object.keys(obj).map(e => `(${obj[e].join(' AND ')})`).join(' OR ')
    document.getElementById('query').innerText = cond ? cond : 'Rules are not set for this scheme.'
}
var field_list = []
function get_field_list(child_table_field, frm) {
    frappe.call({
        method: "myojana.rule_engine.apis.get_meta_api.get_field_lists",
        args: {
            doctype_name: "Beneficiary Profiling",
            field_types: Object.keys(field_types)
        },
        callback: function (response) {
            // Handle the response
            if (response.message) {
                field_list = response.message
                frm.fields_dict[child_table_field].grid.update_docfield_property("rule_field", "options", response.message);
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
const generate_filters = async (frm) => {

    filter_val = []
    frm?.doc?.name_of_beneficiary ? filter_val.push({ "name_of_beneficiary": frm.doc.name_of_beneficiary }) : undefined
    frm?.doc?.primary_member ? filter_val.push({ "primary_member": frm.doc.primary_member }) : undefined
    frm?.doc?.phone_number ? filter_val.push({ "phone_number": frm.doc.phone_number }) : undefined
    frm?.doc?.block ? filter_val.push({ "block": frm.doc.block }) : undefined
    // console.log("hhelo", filter_val)
    let columns = tableConf.columns.map(e => (e.field ? e.field : e.id))
    response = await get_ben_list(frm, ['name', ...columns], filter_val)
}
const addTableFilter = (datatable, elements = [], rows = []) => {
    document.addEventListener('keyup', function (event) {
        if (elements.includes(event.target.id)) {
            let filters = []
            for (el of elements) {
                let val = document.getElementById(el)?.value;
                if (val) {
                    filters.push([el, val])
                }
            }
            if (filters.length) {
                datatable.refresh(rows.filter(row => !filters.map(e => (row[e[0]]?.toString()?.toLowerCase()?.indexOf(e[1]?.toLowerCase()) > -1)).includes(false)))
            } else {
                datatable.refresh(rows)
            }
        }
    });
}
const get_ben_list = async (frm, columns, filters = []) => {
    console.log("filters", filters,)
    let list = await callAPI({
        method: 'myojana.api.eligible_beneficiaries',
        freeze: true,
        args: {
            "scheme": frm.doc.name_of_the_scheme,
            columns: columns,
            filters: filters
        },
        freeze_message: __("Getting beneficiaries..."),
    })
    // scheme_list = list.sort((a, b) => b.matching_rules_per - a.matching_rules_per);
    return list
}
let tableConf = {
    columns: [
        {
            name: "&emsp;",
            id: 'serial_no',
            editable: false,
            resizable: true,
            sortable: false,
            focusable: false,
            dropdown: true,
            width: 100,
            format: (value, columns, ops, row) => {
                return (columns?.[0]?.rowIndex + 1)
            }
        },
        {
            name: "Name of the beneficiary",
            id: 'name_of_the_beneficiary',
            editable: false,
            resizable: false,
            sortable: false,
            focusable: false,
            dropdown: true,
            width: 200,
            format: (value, columns, ops, row, i) => {
                return `<a href="/app/beneficiary-profiling/${row?.name}">${row.name_of_the_beneficiary}</a>`
            }
        },
        {
            name: "Primary member",
            id: 'name_of_parents',
            field: 'select_primary_member.name_of_parents',
            editable: false,
            resizable: false,
            sortable: false,
            focusable: false,
            dropdown: false,
            width: 200,
        },
        {
            name: "Contact number",
            id: 'contact_number',
            editable: false,
            resizable: false,
            sortable: false,
            focusable: false,
            dropdown: false,
            width: 150,
        },
        {
            name: "Block",
            id: 'block_name',
            field: 'ward.block_name',
            editable: false,
            resizable: false,
            sortable: false,
            focusable: false,
            dropdown: false,
            width: 200,
        },
        {
            name: "Name of the settlement",
            id: 'village_name',
            field: 'name_of_the_settlement.village_name',
            editable: false,
            resizable: false,
            sortable: false,
            focusable: false,
            dropdown: false,
            width: 200,
        }
    ],
    rows: [],
    filterable: true
};
const render_table = async (frm) => {
    let response = { count: { total: 0, family_count: 0, }, data: [] };
    get_field_list('rules', frm)
    if (!frm?.doc?.__islocal) {
        let columns = tableConf.columns.map(e => (e.field ? e.field : e.id))
        response = await get_ben_list(frm, ['name', ...columns])
    }
    const container = document.getElementById('eligible_beneficiaries');
    const datatable = new DataTable(container, {
        layout: 'fluid',
        columns: tableConf.columns,
        serialNoColumn: false
    });
    datatable.style.setStyle(`.dt-scrollable`, { height: '800px!important', overflow: 'scroll!important' });
    datatable.style.setStyle(`.dt-instance-1 .dt-cell__content--col-0`, { width: '660px' });
    datatable.refresh(response?.data);
    addTableFilter(datatable, ['name_of_the_beneficiary', 'name_of_parents', 'contact_number', 'block_name'], response?.data)

    document.getElementById('parent').style.display = "flex";
    document.getElementById('parent').style.columnGap = "15px";
    document.getElementById('parent').style.flexWrap = "wrap";
    document.getElementById('total') ? document.getElementById('total').innerText = "Total: Beneficiary: " + response?.count?.total + ',' : ''
    document.getElementById('total_family') ? document.getElementById('total_family').innerText = "Primary member: " + response?.count?.family_count + ',' : ''
    document.getElementById('block_count') ? document.getElementById('block_count').innerText = "Block count: " + response?.count?.block_count + ',' : ''
    document.getElementById('settlement_count') ? document.getElementById('settlement_count').innerText = "Settlement count: " + response?.count?.settlement_count : ''
    frm.set_query("name_of_department", () => { return { page_length: 1000 }; });
    if (frm.doc.department_urlwebsite) {
        frm.add_web_link(frm?.doc?.department_urlwebsite)
    }
    generateQueryString(frm.doc[child_table_field])
}
frappe.ui.form.on("Scheme", {
    async refresh(frm) {
        render_table(frm)
    },
    before_save: async function (frm) {
        if (frm.doc.rules.length > 0) {
            frm.set_value('rules_status', 'Rules')
        } else {
            frm.set_value('rules_status', 'No rules')
        }
    },
    type_of_the_scheme: function (frm) {
        if (frm.doc.type_of_the_scheme != "State") {
            frm.set_value("state", "");
        }
    },
    name_of_department: function (frm) {
        if (frm.doc.department_urlwebsite) {
            frm.add_web_link(frm?.doc?.department_urlwebsite)
        }
    },
    name_of_beneficiary: async function (frm) {
        generate_filters(frm)

    },
    primary_member: async function (frm) {
        generate_filters(frm)
    },
    phone_number: async function (frm) {
        generate_filters(frm)
    },
    block: async function (frm) {
        generate_filters(frm)
    },
});
const form_events = {
    [`${child_table_field}_add`]: (frm, cdt, cdn) => {
        console.log("row added");
        let initial_code = 64
        let row = frappe.get_doc(cdt, cdn);
        if (row.idx <= 26) {
            row.code = (String.fromCharCode(initial_code + row.idx))
        } else {
            row.code = (String.fromCharCode(initial_code + (row.idx - 26)) + String.fromCharCode(initial_code + (row.idx - 26)))
        }
        get_field_list('rules', frm)
    }
}
frappe.ui.form.on('Rule Engine Child', {
    refresh(frm) {
        generateQueryString(frm.doc[child_table_field])
    },
    form_render(frm) {
        generateQueryString(frm.doc[child_table_field])
    },
    ...form_events,
    rule_field: async function (frm, cdt, cdn) {
        let row = frappe.get_doc(cdt, cdn);
        row.type = field_list?.find(f => f.value == row.rule_field)?.type;
        frm.fields_dict[child_table_field].grid.update_docfield_property("operator", "options", field_types[row.type]);
        let options = field_list.find(f => f.value == row.rule_field)?.options;

        if (row.type == "Link") {
            let link_data = await get_Link_list(options)
            frm.fields_dict[child_table_field].grid.update_docfield_property("select", "options", link_data);
        }
        if (row.type == "Select") {
            let link_data = options?.split('\n').filter(f => f).map(e => { return { 'label': e, 'value': e } })
            frm.fields_dict[child_table_field].grid.update_docfield_property("select", "options", link_data);
        }
        frm.fields_dict[child_table_field].grid.refresh();
        var cur_grid = frm.get_field(`${child_table_field}`).grid;
        var cur_doc = locals[cdt][cdn];
        var cur_row = cur_grid.get_row(cur_doc.name);
        // cur_row.toggle_view();
    },
    data: (frm) => {
        frm.fields_dict[child_table_field].grid.refresh();
        generateQueryString(frm.doc[child_table_field])
    },
    date: function (frm, cdt, cdn) {
        let row = frappe.get_doc(cdt, cdn);
        row.data = row.date
        frm.fields_dict[child_table_field].grid.refresh();
        generateQueryString(frm.doc[child_table_field])
    },
    select: function (frm, cdt, cdn) {
        let row = frappe.get_doc(cdt, cdn);
        row.data = row.select
        frm.fields_dict[child_table_field].grid.refresh();
        generateQueryString(frm.doc[child_table_field])
    },
    value: function (frm, cdt, cdn) {
        let row = frappe.get_doc(cdt, cdn);
        row.data = row.value
        frm.fields_dict[child_table_field].grid.refresh();
        generateQueryString(frm.doc[child_table_field])
    }
})
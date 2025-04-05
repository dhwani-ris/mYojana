// Copyright (c) 2023, suvaidyam and contributors
// For license information, please see license.txt
let response;
var common_operators = ["=", "!="]
let columns;
let current_page = 1;
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
function convertJSONToCSV(jsonData, fileName) {
    // Convert JSON to CSV format
    const csvContent = [];
    const keys = Object.keys(jsonData[0]);
    csvContent.push(keys.join(','));

    jsonData.forEach(entry => {
        const values = keys.map(key => {
            let value = entry[key];
            if (typeof value === 'string') {
                value = `"${value}"`; // Enclose in double quotes to handle commas within strings
            }
            return value;
        });
        csvContent.push(values.join(','));
    });

    // Create CSV file
    const csvString = csvContent.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, fileName);
    } else {
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert('Your browser does not support downloading files. Please try a different browser.');
        }
    }
}
function generateQueryString(rows) {
    // console.log("generateQueryString[called]", rows);
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
                // console.log(response.message);
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
const generate_filters = async (frm, datatable, filter_val) => {
    response = await get_ben_list(frm, ['name', ...columns], filter_val)
    await render_counts(response)
    datatable.refresh(response.data)
    // console.log("filter values", filter_val)

}
const addTableFilter = (datatable, elements = [], rows = []) => {
    document.addEventListener('keyup', function (event) {
        if (elements.includes(event.target.id)) {
            let filters = []
            for (let el of elements) {
                let val = document.getElementById(el)?.value;
                if (val) {
                    filters.push({ [el]: __(val) });
                } else {
                    filters = filters.filter(filter => !filter.hasOwnProperty(el));
                }
            }
            generate_filters(cur_frm, datatable, filters)
            datatable.refresh(rows)
        }
    });
}
const get_ben_list = async (frm, columns, filters = [], start = 0, page_imit = 100) => {
    // console.log("filters", filters,)
    let list = await callAPI({
        method: 'myojana.api.eligible_beneficiaries',
        freeze: true,
        args: {
            "scheme": frm.doc.name,
            columns: columns,
            filters: filters,
            start: start,
            page_imit: page_imit
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
                // console.log(current_page)
                return (columns?.[0]?.rowIndex + 1)
            }
        },
        {
            name: __("Name of the beneficiary"),
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
            name: __("Primary member"),
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
            name: __("Contact number"),
            id: 'contact_number',
            editable: false,
            resizable: false,
            sortable: false,
            focusable: false,
            dropdown: false,
            width: 150,
        },
        {
            name: __("Block"),
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
            name: __("Name of the settlement"),
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
const render_counts = async(response)=>{
    document.getElementById('total') ? document.getElementById('total').innerText = "Total: Beneficiary: " + response?.count?.total + ',' : ''
    document.getElementById('total_family') ? document.getElementById('total_family').innerText = "Primary member: " + response?.count?.family_count + ',' : ''
    document.getElementById('block_count') ? document.getElementById('block_count').innerText = "Block count: " + response?.count?.block_count + ',' : ''
    document.getElementById('settlement_count') ? document.getElementById('settlement_count').innerText = "Settlement count: " + response?.count?.settlement_count : ''
}
var page_list
const render_table = async (frm) => {
    response = { count: { total: 0, family_count: 0, }, data: [] };
    let total_page = 0;
    get_field_list('rules', frm)
    if (!frm?.doc?.__islocal) {
        columns = tableConf.columns.map(e => (e.field ? e.field : e.id))
        response = await get_ben_list(frm, ['name', ...columns])
        total_page = Math.ceil((response?.count.total / 100));
    }
    page_list = `<li class="page-item">
    <a class="page-link" id="previous-page">
        <span>&laquo;</span>
        <span class="sr-only">Previous</span>
    </a>
    </li>`
    for (let i = 1; i <= total_page; i++) {
        page_list = page_list + `<li class="page-item"><a class="page-link page-value">${i}</a></li>`
        // console.log("loop page", i)
    }
    page_list = page_list + `
    <li class="page-item">
    <a class="page-link" id="next-page"">
        <span>&raquo;</span>
        <span class="sr-only">Next</span>
    </a>
    </li>`
    let pagination_page = document.getElementById('page_list')
    pagination_page.innerHTML = page_list

    const container = document.getElementById('eligible_beneficiaries');
    const datatable = new DataTable(container, {
        layout: 'fluid',
        columns: tableConf.columns,
        serialNoColumn: false
    });
    // next page on pagination
    document.getElementById('next-page').onclick = () => {
        current_page += 1
        // console.log(current_page)
    }
    // previous page of pagination
    document.getElementById("previous-page").onclick = () => {
        current_page -= 1
        // console.log(current_page)
    }
    const elements = document.querySelectorAll('.page-value');
    elements.forEach(element => {
        element.addEventListener('click', async function (event) {
            current_page = Number(event.target.innerText);
            let active_page = Number(event.target.innerText)
            const start = (active_page > 1 ? ((active_page * (100)) - 100) : 0)
            response = await get_ben_list(frm, ['name', ...columns], [], start, 100)
            datatable.refresh(response.data);
        });
    });
    datatable.style.setStyle(`.dt-scrollable`, { height: '400px!important', overflow: 'scroll!important' });
    datatable.style.setStyle(`.dt-instance-1 .dt-cell__content--col-0`, { width: '660px' });
    datatable.refresh(response?.data);
    addTableFilter(datatable, ['name_of_the_beneficiary', 'name_of_parents', 'contact_number', 'block_name'], response?.data)
    document.getElementById('parent').style.display = "flex";
    document.getElementById('parent').style.columnGap = "15px";
    document.getElementById('parent').style.flexWrap = "wrap";
    await render_counts(response)
    // document.getElementById('pagination') ? document.getElementById('pagination').innerHTML = paginationHTML : ""
    frm.set_query("name_of_department", () => { return { page_length: 1000 }; });
    if (frm.doc.department_urlwebsite) {
        frm.add_web_link(frm?.doc?.department_urlwebsite)
    }
    generateQueryString(frm.doc[child_table_field])
}
frappe.ui.form.on("Scheme", {
    async refresh(frm) {
        // render_table(frm)
        // document.getElementById('export-exel').onclick = function () {
        //     convertJSONToCSV(response.data, "eligible_ben")
        // }
        let wrapper = document.getElementById('eligible_beneficiaries');
        new SchemeEligibleBen(frm, wrapper)
    },
    async onload(frm) {
    },
    before_save: async function (frm) {
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
    // name_of_beneficiary: async function (frm) {
    //     generate_filters(frm)

    // },
    // primary_member: async function (frm) {
    //     generate_filters(frm)
    // },
    // phone_number: async function (frm) {
    //     generate_filters(frm)
    // },
    // block: async function (frm) {
    //     generate_filters(frm)
    // },
});
const form_events = {
    [`${child_table_field}_add`]: (frm, cdt, cdn) => {
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
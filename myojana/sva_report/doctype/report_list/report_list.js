
let filters_data;

function fetchAndRenderData(frm, limit, filters) {
    frappe.call({
        method: "myojana.sva_report.controllers.get_report_data.execute",
        args: {
            doc: frm.doc.name,
            limit: limit,
            filters: filters,
        },
        callback: function (response) {
            if (response.message) {
                renderDataTable(response.message);
                filters_data = response.message.filters
                buttion(frm)
            } else {
                console.error("Error fetching data from API.");
            }
        }
    });
}

frappe.ui.form.on("Report List", {
    refresh(frm) {
        // to hide unwanted buttons
        // $('.standard-actions').hide();
        //

        if (!frm.is_new() == 1) {
            console.log("frm.is_new()",frm.is_new());
            $('.standard-actions').hide();
            fetchAndRenderData(frm, {});
            DataExportButton(frm)
        }

        frm.add_custom_button('Filter', () => {
            frappe.prompt(
                filter_fields = filters_data?.map(fltr => ({
                    fieldname: fltr.fieldname,
                    fieldtype: fltr.fieldtype,
                    label: fltr.label,
                    options: fltr.options,
                    default: fltr.default || ''
                })) || [],
                function (values) {
                    let appliedFilters = {};
                    filter_fields.forEach(filter => {
                        appliedFilters[filter.fieldname] = values[filter.fieldname];
                    });
                    fetchAndRenderData(frm, {}, appliedFilters);
                },
                __('Apply')
            );
        });

    }
});


function renderDataTable(e) {
    Total(e.total_records, e.data.length)
    let columns = e.columns.map(function (coloum) {
        return `<th>${coloum.label}</th>`
    })
    let data = e.data.map(function (row) {
        let rowData = [];
        for (let column of e.columns) {
            rowData.push(row[column.fieldname]);
        }
        return rowData;
    });
    let datatable = new frappe.DataTable("#list", {
        columns: columns,
        data: data,
        width: '80%',
    });
    datatable.refresh();
}
function Total(total_count = 0, page_count = 0) {
    let buttonsHTML = `
    <div style="float:; display:block;">
    Total esult <span id="currentPage"><span id="totalPages">${total_count}</span>
</div>
    `;

    // document.getElementById("total").innerHTML = buttonsHTML;
}
function buttion(frm) {
    let buttonsHTML = `
    <button style="padding: 5px 20px; margin-top: 5px; border: none; background-color: rgb(249, 249, 248); border-width: 0.5px 0px 0.5px 0.5px; border-style: solid; border-color: rgb(236,236,237); border-radius: 5px 0 0 5px;" id="limit20">20</button>
    <button style="padding: 5px 20px; margin-top: 5px; border: none; background-color: rgb(249, 249, 248); border-width: 0.5px 0px 0.5px 0.5px; border-style: solid; border-color: rgb(236,236,237); margin-left: -4px;" id="limit100">100</button>
    <button style="padding: 5px 20px; margin-top: 5px; border: none; background-color: rgb(249, 249, 248); border-width: 0.5px 0px 0.5px 0.5px; border-style: solid; border-color: rgb(236,236,237); margin-left: -4px;" id="limit500">500</button>
    <button style="padding: 5px 20px; margin-top: 5px; border: none; background-color: rgb(249, 249, 248); border-width: 0.5px 0.5px 0.5px 0.5px; border-style: solid; border-color: rgb(236,236,237); margin-left: -4px; border-radius: 0 5px 5px 0;" id="limit1000">1000</button>
`;

    document.getElementById("button").innerHTML = buttonsHTML;
    function removeActiveClass() {
        let buttons = document.querySelectorAll("#button button");
        buttons.forEach(button => {
            button.style.backgroundColor = '';
            button.style.color = '';
        });
    }

    document.getElementById("limit20").addEventListener("click", function () {
        removeActiveClass();
        this.style.backgroundColor = 'rgb(249,248,249)';
        this.style.color = 'black';
        fetchAndRenderData(frm, 20);
    });
    document.getElementById("limit100").addEventListener("click", function () {
        removeActiveClass();
        this.style.backgroundColor = 'rgb(249,248,249)';
        this.style.color = 'black';
        fetchAndRenderData(frm, 100);
    });
    document.getElementById("limit500").addEventListener("click", function () {
        removeActiveClass();
        this.style.backgroundColor = 'rgb(249,248,249)';
        this.style.color = 'black';
        fetchAndRenderData(frm, 500);
    });
    document.getElementById("limit1000").addEventListener("click", function () {
        removeActiveClass();
        this.style.backgroundColor = 'rgb(249,248,249)';
        this.style.color = 'black';
        fetchAndRenderData(frm, 1000);
    });
}


function DataExportButton(frm) {
    frm.add_custom_button(__('Export'), function () {
            const a = document.createElement('a');
            a.href = `/api/method/myojana.sva_report.controllers.get_report_data.execute?doc=${frm.doc.name}&csv_export=1`;
            a.target = '_blank'; // Open link in new tab
            a.download = ''; // This attribute triggers the download
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
    });
}

function downloadTableAsCSV(data, filename) {
    var csv = convertToCSV(data);
    var blob = new Blob([csv], { type: 'text/csv' });
    var link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
}

function convertToCSV(data) {
    var csv = '';
    var headers = Object.keys(data[0]);
    csv += headers.join(',') + '\n';
    data.forEach(function (row) {
        var values = headers.map(function (header) {
            return row[header];
        });
        csv += values.join(',') + '\n';
    });
    return csv;
}

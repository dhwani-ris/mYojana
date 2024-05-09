frappe.ui.form.on("Report List", {
    refresh(frm) {
        if (!frm.is_new() == 1) {
            fetchAndRenderData(frm);
        }
        buttion(frm)
        DataExportButton(frm)
    },
});

function fetchAndRenderData(frm, limit) {
    frappe.call({
        method: "myojana.sva_report.controllers.get_report_data.execute",
        args: {
            doc: frm.doc.name,
            limit: limit
        },
        callback: function (response) {
            if (response.message) {
                renderDataTable(response.message);
            } else {
                console.error("Error fetching data from API.");
            }
        }
    });
}

function renderDataTable(e) {
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
        width: '50%',
    });
    datatable.refresh();
}

// function buttion(frm) {
//     let buttonsHTML = `
//     <button style="padding: 5px 20px; margin-top: 5px;" id="limit20">20</button>
//     <button style="padding: 5px 20px; margin-top: 5px;" id="limit100">100</button>
//     <button style="padding: 5px 20px; margin-top: 5px;" id="limit500">500</button>
//     <button style="padding: 5px 20px; margin-top: 5px;" id="limit1000">1000</button>

//     `;
//     document.getElementById("button").innerHTML = buttonsHTML;
//     document.getElementById("limit20").addEventListener("click", function () {
//         fetchAndRenderData(frm, 20);
//     });
//     document.getElementById("limit100").addEventListener("click", function () {
//         fetchAndRenderData(frm, 100);
//     });
//     document.getElementById("limit500").addEventListener("click", function () {
//         fetchAndRenderData(frm, 500);
//     });
//     document.getElementById("limit1000").addEventListener("click", function () {
//         fetchAndRenderData(frm, 1000);
//     });
// }


function buttion(frm) {
    let buttonsHTML = `
    <button style="padding: 5px 20px; margin-top: 5px;" id="limit20">20</button>
    <button style="padding: 5px 20px; margin-top: 5px;" id="limit100">100</button>
    <button style="padding: 5px 20px; margin-top: 5px;" id="limit500">500</button>
    <button style="padding: 5px 20px; margin-top: 5px;" id="limit1000">1000</button>
    `;
    document.getElementById("button").innerHTML = buttonsHTML;

    // Function to remove 'active' class from all buttons
    function removeActiveClass() {
        let buttons = document.querySelectorAll("#button button");
        buttons.forEach(button => {
            button.style.backgroundColor = '';
            button.style.color = '';
            button.style.border = '';
        });
    }

    document.getElementById("limit20").addEventListener("click", function () {
        removeActiveClass();
        this.style.backgroundColor = '#007bff';
        this.style.color = '#fff';
        this.style.border = '1px solid #007bff';
        fetchAndRenderData(frm, 20);
    });
    document.getElementById("limit100").addEventListener("click", function () {
        removeActiveClass();
        this.style.backgroundColor = '#007bff';
        this.style.color = '#fff';
        this.style.border = '1px solid #007bff';
        fetchAndRenderData(frm, 100);
    });
    document.getElementById("limit500").addEventListener("click", function () {
        removeActiveClass();
        this.style.backgroundColor = '#007bff';
        this.style.color = '#fff';
        this.style.border = '1px solid #007bff';
        fetchAndRenderData(frm, 500);
    });
    document.getElementById("limit1000").addEventListener("click", function () {
        removeActiveClass();
        this.style.backgroundColor = '#007bff';
        this.style.color = '#fff';
        this.style.border = '1px solid #007bff';
        fetchAndRenderData(frm, 1000);
    });
}


function DataExportButton(frm) {
    frm.add_custom_button(__('Export'), function () {
        frappe.call({
            method: "myojana.sva_report.controllers.get_report_data.execute",
            args: {
                doc: frm.doc.name,
                limit: "all",
            },
            callback: function (response) {
                if (response.message) {
                    downloadTableAsCSV(response.message.data, "exported_data.csv", "text/csv");
                } else {
                    console.error("Error fetching data from API.");
                }
            }
        });
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

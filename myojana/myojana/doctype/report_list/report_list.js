frappe.ui.form.on("Report List", {
    refresh(frm) {
        if (!frm.is_new() == 1) {
            fetchAndRenderData(frm);
        }
        DataExportButton(frm)
    },
});

function fetchAndRenderData(frm) {
    frappe.call({
        method: "myojana.sva_report.controllers.get_report_data.execute",
        args: {
            doc: frm.doc.name,
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
        paging: true, // Enable pagination
        pageLength: 10, // Set number of rows per page
        lengthChange: false, // Hide length change dropdown
        info: false, // Hide table information summary
        searching: false, // Disable search
        ordering: false,
        pagingType: 'simple_numbers'
    });
    datatable.refresh();
    // new datatable('#example', {
    //     pagingType: 'simple_numbers'
    // });

}

function DataExportButton(frm) {
    frm.add_custom_button(__('Export'), function () {
        frappe.call({
            method: "myojana.sva_report.controllers.get_report_data.execute",
            args: {
                doc: frm.doc.name,
            },
            callback: function (response) {
                if (response.message) {
                    renderDataTable(response.message);
                    downloadFile(response.message.data, "exported_data.csv", "text/csv");
                } else {
                    console.error("Error fetching data from API.");
                }
            }
        });
    });
}
function downloadFile(data, filename, type) {
    if (typeof data !== 'string') {
        data = JSON.stringify(data);
    }
    var blob = new Blob([data], { type: type });
    var link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
}
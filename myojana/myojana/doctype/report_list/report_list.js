frappe.ui.form.on("Report List", {
    refresh(frm) {
        fetchAndRenderData(frm);
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
        // filters: [
        //     { name: 'column1', label: __('Column 1'), fieldtype: 'Data', },
        //     { name: 'column2', label: __('Column 2'), fieldtype: 'Data', },
        //     // Add more filters as needed
        // ],
        // layout: 'fluid',
    });

    datatable.refresh();
}
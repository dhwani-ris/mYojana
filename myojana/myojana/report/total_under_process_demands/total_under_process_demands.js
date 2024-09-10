// Copyright (c) 2023, suvaidyam and contributors
// For license information, please see license.txt
var filters = [
	{
		"fieldname": "from_date",
		"fieldtype": "Date",
		"label": "From Date",
	},
	{
		"fieldname": "to_date",
		"fieldtype": "Date",
		"label": "To Date"
	}
	
]
frappe.query_reports["Total under process demands"] = {
	filters: filters,

	"formatter": function(value, row, column, data, default_formatter) {
        // Make the 'name' field clickable to open the relevant document
		console.log(column.fieldname);
        if (column.fieldname === "status" && data) {
            value = `<a href="/app/beneficiary-profiling/?status=${data.status}" style="">${value}</a>`;
        }
        
        value = default_formatter(value, row, column, data);
        return value;
    }
};

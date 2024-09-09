// Copyright (c) 2024, suvaidyam and contributors
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
	
];
frappe.query_reports["Total Demands"] = {
	filters: filters,

	"formatter": function(value, row, column, data, default_formatter) {
        // Make the 'name' field clickable to open the relevant document
        if (column.fieldname === "current_status" && data) {
            value = `<a href="/app/beneficiary-profiling/?status=${data.current_status}" style="">${value}</a>`;
        }
        
        value = default_formatter(value, row, column, data);
        return value;
    }
};

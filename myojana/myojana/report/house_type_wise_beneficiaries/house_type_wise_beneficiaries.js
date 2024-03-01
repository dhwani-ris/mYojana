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
	
];
if (frappe.user_roles.includes("Admin")) {
	filters.push({
		"fieldname": "state",
		"fieldtype": "Link",
		"label": "State",
		"options": "State"
	},
	// {
	// 	"fieldname": "district",
	// 	"fieldtype": "Link",
	// 	"label": "District",
	// 	"options": "District",
	// 	"get_query": function() {
	// 		var state = frappe.query_report.get_filter_value('state');
	// 		return {
	// 			filters: {
	// 				'state': state
	// 			}
	// 		};
	// 	}
	// }
	)
}
frappe.query_reports["House type-wise beneficiaries"] = {
	filters: filters
};

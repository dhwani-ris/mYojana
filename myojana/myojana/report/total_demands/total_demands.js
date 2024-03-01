// Copyright (c) 2023, suvaidyam and contributors
// For license information, please see license.txt

var filters = [
	{
		"fieldname": "from_date",
		"fieldtype": "Date",
		"label": __("From Date"),
	},
	{
		"fieldname": "to_date",
		"fieldtype": "Date",
		"label": __("To Date")
	}
	
];
// if (!frappe.user_roles.includes("MIS executive") || frappe.user_roles.includes("Administrator")) {
// 	filters.push({
// 		"fieldname": "state",
// 		"fieldtype": "Link",
// 		"label": "State",
// 		"options": "State"
// 	})
// }


frappe.query_reports["Total Demands"] = {
	filters: filters,
};

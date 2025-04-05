// Copyright (c) 2024, dhwaniris and contributors
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
	},
	{
		"fieldname": "milestone",
		"fieldtype": "Link",
		"label": "Support category",
		"options":"Milestone category"
	},

];
if (!frappe.user_roles.includes("MIS executive") || frappe.user_roles.includes("Administrator")) {
	filters.push({
		"fieldname": "centre",
		"fieldtype": "Link",
		"options": "Centre",
		"label": "Centre"
		
	})
}
frappe.query_reports["Overall tracking of scheme"] = {
	"filters": filters
};

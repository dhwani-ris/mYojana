// Copyright (c) 2023, Management System for Agrasarteach@suvaidyam.com and contributors
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
if (!frappe.user_roles.includes("MIS executive") || frappe.user_roles.includes("Administrator")) {
	filters.push({
		"fieldname": "csc",
		"fieldtype": "Link",
		"label": "Centre",
		"options": "Centre"
	})
}
frappe.query_reports["Beneficiary"] = {
	filters: filters
};

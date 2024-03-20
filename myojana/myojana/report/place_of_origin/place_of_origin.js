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
	},


];
if (!frappe.user_roles.includes("MIS executive") || frappe.user_roles.includes("Administrator")) {
	filters.push({
		"fieldname": "centre",
		"fieldtype": "Link",
		"label": "Centre",
		"options": "Centre"
	})
}
frappe.query_reports["Place of origin"] = {
	filters: filters
};

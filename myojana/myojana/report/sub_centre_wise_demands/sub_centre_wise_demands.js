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
if (frappe.user_roles.includes("Administrator")) {
	filters.push({
		"fieldname": "state",
		"fieldtype": "Link",
		"label": "State",
		"options": "State"
	},


	)
}
frappe.query_reports["Sub centre wise demands"] = {
	filters: filters,
};

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
if (!frappe.user_roles.includes("MIS executive") || frappe.user_roles.includes("Administrator")) {
	filters.push({
		"fieldname": "state",
		"fieldtype": "Link",
		"label": "State",
		"options": "State"
	},
	{
		"fieldname": "district",
		"fieldtype": "Link",
		"label": "District",
		"options": "District",
		"get_query": function() {
			var state = frappe.query_report.get_filter_value('state');
			return {
				filters: {
					'state': state
				}
			};
		}
	}
	)
}
frappe.query_reports["District-wise demands"] = {
	filters: filters,
};

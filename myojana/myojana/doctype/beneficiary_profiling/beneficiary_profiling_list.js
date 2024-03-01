frappe.listview_settings['Beneficiary Profiling'] = {
	// add fields to fetch
	add_fields: [
		'name_of_the_beneficiary', 'date_of_visit', 'contact_number',
		'select_primary_member', 'overall_status', 'numeric_overall_status'
	],
	hide_name_column: true, // hide the last column which shows the `name`
}

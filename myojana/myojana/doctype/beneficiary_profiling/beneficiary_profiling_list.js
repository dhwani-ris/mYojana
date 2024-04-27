function callAPI(options) {
	return new Promise((resolve, reject) => {
		frappe.call({
			...options,
			callback: async function (response) {
				resolve(response?.message || response?.value)
			}
		});
	})
}

frappe.listview_settings['Beneficiary Profiling'] = {
	before_render: async function () {
		let installed_apps = await callAPI({
			method: 'myojana.api.get_installed_apps',
			freeze: true,
			freeze_message: __("Getting Apps"),
		})
		if (installed_apps && installed_apps.includes('sva_report')) {
			cur_list?.page?.add_inner_button("Go to report", function () {
				window.location.href = '/report'
			})
		}
	},
	add_fields: [
		'name_of_the_beneficiary', 'date_of_visit', 'contact_number',
		'select_primary_member', 'overall_status', 'numeric_overall_status'
	],
	hide_name_column: true,
}

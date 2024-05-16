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
			cur_list?.page?.add_inner_button("Go to report", function () {
				window.location.href = 'report-list/Beneficiary%20Profiling'
			})
			cur_list?.page?.add_inner_button("WhatsApp", async ()=> {
				let res = await callAPI({
					 method: 'myojana.apis.whatsapp.send',
					freeze: true,
					args: {
						fields: ['is_primary_member_link_through_phone_number']
					},
					freeze_message: __("Sending message..."),
				})
				console.log("Res", res);
			})

	},
	add_fields: [
		'name_of_the_beneficiary', 'date_of_visit', 'contact_number',
		'select_primary_member', 'overall_status', 'numeric_overall_status'
	],
	hide_name_column: true,
}

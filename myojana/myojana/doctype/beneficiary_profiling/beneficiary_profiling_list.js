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
	refresh: function (listview) {
		// console.log(listview)
		// listview.page.add_actions_menu_item("WhatsApp", async function () {
		// 	for(ben of listview.data){
		// 		console.log("//////", ben)

		// 	}
		//     // await update_enable_disable(listview, 1)
		// });
	},
	onload: async function (listview) {
		// $('.layout-side-section').hide();
		// if(frappe.user_roles.includes("Admin") && !frappe.user_roles.includes("Administrator")){
		// 	listview.page.add_menu_item('List Settings',()=> listview.show_list_settings(),true)
		// }
	},
	before_render: async function () {
		cur_list?.page?.add_inner_button("Beneficiary report", function () {
			window.location.href = 'report-list/Beneficiary%20Profiling'
		})

	},
	add_fields: [
		'name_of_the_beneficiary', 'date_of_visit', 'contact_number',
		'select_primary_member', 'overall_status', 'numeric_overall_status'
	],
	hide_name_column: true,
}

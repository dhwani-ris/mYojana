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
const sendIdCard =  async(phoneNo="917091668703") =>{
	let res = await callAPI({
		method: 'myojana.apis.whatsapp.send',
	   freeze: true,
	   args: {
		   fields: ['is_primary_member_link_through_phone_number'],
		   phoneNo:phoneNo,
		   name:"Abhishek"
	   },
	   freeze_message: __("Sending message..."),
   })
}

frappe.listview_settings['Beneficiary Profiling'] = {
	refresh: function(listview) {
		$("use.like-icon").hide();
		$(".comment-count").hide();
	    // $(".frappe-timestamp").hide();
	    $(".avatar-small").hide();
 },
	// refresh: function (listview) {
        // console.log(listview)
        // listview.page.add_actions_menu_item("WhatsApp", async function () {
		// 	for(ben of listview.data){
		// 		console.log("//////", ben)

		// 	}
        //     // await update_enable_disable(listview, 1)
        // });

    // },
	onload: function (listview) {
        $('.layout-side-section').hide();
    },
	before_render: async function () {
			cur_list?.page?.add_inner_button("Beneficiary report", function () {
				window.location.href = 'report-list/Beneficiary%20Profiling'
			})
			// cur_list?.page?.add_inner_button("WhatsApp", async ()=> {
			// 	let res = await sendIdCard()
			// 	console.log("Res", res);
			// })

	},
	add_fields: [
		'name_of_the_beneficiary', 'date_of_visit', 'contact_number',
		'select_primary_member', 'overall_status', 'numeric_overall_status'
	],
	hide_name_column: true,
}

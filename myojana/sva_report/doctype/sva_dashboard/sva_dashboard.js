// Copyright (c) 2024, dhwaniris and contributors
// For license information, please see license.txt
const apply_filter = async () => {
    var child_table = cur_frm.fields_dict['cards'].grid;
    let existing_cards = cur_frm.doc.cards.map((item) => {return item.card});
    if (child_table) {
        try {
            child_table.get_field('card').get_query = function () {
                return {
                    filters: [
                        ['Number Card', 'name', 'not in', existing_cards]
                    ],
                    page_length: 1000
                };
            };
        } catch (error) {
            console.error(error)
        }
    }
}
frappe.ui.form.on("SVA Dashboard", {
	async refresh(frm) {
        await apply_filter();
	},
});
frappe.ui.form.on("SVA Dashboard Card Child", {
    async cards_add(frm, cdt, cdn) {
        await apply_filter();
    },
    async form_render(frm, cdt, cdn) {
        await apply_filter();
    }
});
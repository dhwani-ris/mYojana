
async function update_enable_disable(listview, value) {
    let names = [];
    await $.each(listview.get_checked_items(), function (key, value) {
        names.push(value.name);
    });
    if (names.length === 0) {
        frappe.throw(__("No rows selected."));
    }
    let res = await toggleEnableDisable(names, value)
    listview.clear_checked_items()
    listview.refresh()
    if (value === 1) {
        frappe.msgprint(`<p>${res.message} Schemes enabled successfully</p>`)
    } else {
        frappe.msgprint(`<p>${res.message} Schemes disabled successfully</p>`)
    }
}
const toggleEnableDisable = async (list, value) => {
    return await frappe.call({
        method: "myojana.apis.update_scheme.toggle_enable_disable",
        freeze: true,
        args: {
            "list": list,
            "value": value
        },
        freeze_message: __("Updating schemes..."),
        callback: function (response) {
            if (response.message) {
                return response.message
            } else {
                console.log("Api Failed....")
            }
        }
    });
}
frappe.listview_settings['Scheme'] = {
    refresh: function (listview) {
        // console.log(listview)
        listview.page.add_actions_menu_item("Enable Selected", async function () {
            await update_enable_disable(listview, 1)
        });
        listview.page.add_actions_menu_item("Disable Selected", async function () {
            await update_enable_disable(listview, 0)
        });
    },
    onload: function (listview) {
        $('.layout-side-section').hide();
    }
};
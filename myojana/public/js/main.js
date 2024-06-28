setTimeout(() => {
    if (frappe.user_roles.includes("Sub-Centre") || frappe.user_roles.includes("CSC Member") || frappe.user_roles.includes("MIS executive")) {
        if (!frappe.user_roles.includes("Administrator")) {
            document.getElementById('navbar-search').hidden = true
            document.getElementsByClassName('search-icon')[0].hidden = true
        } else {
            document.getElementById('navbar-search').hidden = false
            document.getElementsByClassName('search-icon')[0].hidden = false
        }
    } else {
        document.getElementById('navbar-search').hidden = false
        document.getElementsByClassName('search-icon')[0].hidden = false
    }
}, 100);

frappe.router.on('change', async () => {
    let cur_router = await frappe.get_route()
    if (cur_router[0]!='Workspaces') {
        $('.sidebar-toggle-btn').hide()
        $('.layout-side-section').hide();
        $('.custom-actions').hide()
    } else {
        $('.sidebar-toggle-btn').show()
        $('.layout-side-section').show();
    }
});

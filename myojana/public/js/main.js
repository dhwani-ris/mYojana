frappe.router.on('change', async () => {
    let cur_router = await frappe.get_route();
    if (cur_router[0] != 'Workspaces') {
        $('.sidebar-toggle-btn').hide();
        $('.layout-side-section').hide();
    } else {
        $('.sidebar-toggle-btn').show();
        $('.layout-side-section').show();
    }
});

async function callAPI(options) {
    return new Promise((resolve, reject) => {
        frappe.call({
            ...options,
            callback: function (response) {
                resolve(response?.message || response?.value);
            },
            error: function (error) {
                reject(error);
            }
        });
    });
}

async function fetchSettings() {
    try {
        let myojanaSetting = await callAPI({
            method: 'myojana.apis.myojana_setting.get_myojana_setting',
            freeze: true,
            args: {
                fields: ['is_primary_member_link_through_phone_number']
            },
        });
        return myojanaSetting
        // console.log(myojanaSetting);
    } catch (error) {
        console.error('Error fetching myojana settings:', error);
    }
}

let data = {};
fetchSettings().then((res) => {data = res}).catch((err) => {console.log(err);});
console.log("jhvhjvhj",data);

setTimeout(() => {
    if (frappe.user_roles.includes("Sub-Centre") || frappe.user_roles.includes("CSC Member") || frappe.user_roles.includes("MIS executive")) {
        if (!frappe.user_roles.includes("Administrator")) {
            document.getElementById('navbar-search').hidden = true;
            document.getElementsByClassName('search-icon')[0].hidden = true;
        } else {
            document.getElementById('navbar-search').hidden = false;
            document.getElementsByClassName('search-icon')[0].hidden = false;
        }
    } else {
        document.getElementById('navbar-search').hidden = false;
        document.getElementsByClassName('search-icon')[0].hidden = false;
    }
}, 100);

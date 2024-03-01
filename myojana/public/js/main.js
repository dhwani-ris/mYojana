setTimeout(() => {
    if(frappe.user_roles.includes("Help-desk member") || frappe.user_roles.includes("CSC Member") || frappe.user_roles.includes("MIS executive")){
        if(!frappe.user_roles.includes("Administrator")){
            document.getElementById('navbar-search').hidden = true
            document.getElementsByClassName('search-icon')[0].hidden = true
        }else{
            document.getElementById('navbar-search').hidden = false
            document.getElementsByClassName('search-icon')[0].hidden = false
        }
    }else{
        document.getElementById('navbar-search').hidden = false
        document.getElementsByClassName('search-icon')[0].hidden = false
    }
}, 100);

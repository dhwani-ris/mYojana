// Copyright (c) 2024, dhwaniris and contributors
// For license information, please see license.txt
const wait = (seconds)=>{
    return new Promise((resolve,reject)=>{
        setTimeout(()=>{
            resolve();
        },seconds*1000)
    })    
}
frappe.ui.form.on("Whats App Template", {
	refresh(frm) {

	},
    html:(frm)=>{
        frappe.call({
            method: "myojana.whatsapp.utils.htmltoimg.preview_image",
            args: {
                doctype:frm.doc.variable_reference_doctype,
                doc:frm.doc.select_reference_variable,
                template:frm.doc.html
            }
        }).then(async(res)=>{
            document.getElementById("preview_html").innerHTML = `<img src="data:image/png;base64,${res.message}" />`;
            
        }).catch(err=>{
            console.log("Error",err);
        })
    }
});

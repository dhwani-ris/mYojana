// Copyright (c) 2024, dhwaniris and contributors
// For license information, please see license.txt
const wait = (seconds)=>{
    return new Promise((resolve,reject)=>{
        setTimeout(()=>{
            resolve();
        },seconds*1000)
    })    
}

const render_image = (frm)=>{    
    frappe.call({
        method: "myojana.apis.html_to_image.preview_image",
        headers:{

        },
        args: {
            doctype:frm.doc.ref_doctype,
            doc:frm.doc.ref_doc,
            template:frm.doc.html,
            options:frm.doc.options
        }
    }).then(async(res)=>{
        document.getElementById("preview_html").innerHTML = `<img src="data:image/png;base64,${res.message}" />`;
        
    }).catch(err=>{
        console.log("Error",err);
    })
}
frappe.ui.form.on("App Template", {
	refresh(frm) {
        if(frm.doc.ref_doctype&&frm.doc.ref_doc){
            render_image(frm);
        }
	},
    html:(frm)=>{
        // if(frm.doc.ref_doctype&&frm.doc.ref_doc){
        //     render_image(frm);
        // }
    },
    preview:(frm)=>{
        if(frm.doc.ref_doctype&&frm.doc.ref_doc){
            render_image(frm);
        }
    },
});

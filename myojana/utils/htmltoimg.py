import frappe
import imgkit

def create_image(ben_id):
    # Retrieve the document based on the Beneficiary ID
    doc = frappe.get_doc("Beneficiary Profiling", ben_id)

    # Get organization details if available
    if doc.custom_which_organization_do_you_want_to_be_part_of or doc.custom_which_organization_are_you_part_of:
        org = doc.custom_which_organization_do_you_want_to_be_part_of or doc.custom_which_organization_are_you_part_of
        org_details = frappe.db.get_value("Org Signature", org, ['logo', 'email', 'signature', 'name'], as_dict=True)

    # Adjusted HTML and CSS content
    html_content = f'''
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                width: 447px;
                height: 273px;
                background-color: #f4f4f4;
            }}
            .card {{
                background-color: #ffffff;
                 width: 445px;
                height: 270px;
                padding: 10px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                margin: 10px auto;
            }}
            .header {{
                text-align: center;
                margin-bottom: 10px;
            }}
            .header h4 {{
                font-size: 14px;
                color: #e88e23;
                margin: 0;
            }}
            .header p {{
                font-size: 10px;
                color: #000;
                margin: 0;
            }}
            .logo {{
                width: 60px;
                height: 60px;
                position: absolute;
                top: 10px;
                right: 10px;
            }}
            .photo {{
                float: left;
                width: 90px;
                height: 100px;
                border-radius: 10%;
                border: 2px solid #e88e23;
                margin-right: 10px;
            }}
            .details {{
                font-size: 12px;
                color: #000;
                line-height: 1.4em;
            }}
            .details strong {{
                color: #333;
            }}
            .note {{
                font-size: 10px;
                color: #777;
                margin-top: 10px;
            }}
            .signature {{
                text-align: right;
                margin-top: 10px;
            }}
            .signature p {{
                margin: 0;
                font-size: 10px;
                color: #000;
                padding-bottom: 50px;
            }}
        </style>
    </head>
    <body>
        <div class="card">
            <div class="header">
                <h4>Hawkers Joint Action Committee</h4>
                <p>Membership Card</p>
                <img src="{org_details['logo']}" alt="Organization Logo" class="logo">
            </div>
            
            <div class="photo">
                <img src="{doc.custom_photo}" alt="Member Photo" width="90" height="100">
            </div>
            <div class="details">
                <span><strong>Name</strong>: {doc.name_of_the_beneficiary}</span><br>
                <span><strong>ID</strong>: {doc.name}</span><br>
                <span><strong>Date of issue</strong>: {frappe.utils.formatdate(doc.date_of_visit, "dd-MM-yyyy")}</span><br>
                <span><strong>DOB</strong>: {doc.date_of_birth}</span><br>
                <span><strong>Mobile Number</strong>: {doc.contact_number}</span><br>
                <span><strong>Blood Group</strong>: {doc.custom_blood_group}</span><br>
                <span><strong>Location</strong>: {doc.address_with_landmark}</span>
            </div>
            
            <div class="note">
                <p>Note: This membership card is issued with your knowledge and consent. If you do not agree, please email at <a href="mailto:{org_details['email']}">{org_details['email']}</a></p>
            </div>
            <div class="signature">
                <img src="{org_details['signature']}" alt="Authorizer Signature" width="100" height="auto">
                <p><strong>Signature of Authorizer</strong></p>
            </div>
        </div>
    </body>
    </html>
    '''

    # Convert HTML to image with fixed size
    options = {
        'width': 447,
        'height': 273,
    }

    return imgkit.from_string(html_content, 'output_image.png', options=options)

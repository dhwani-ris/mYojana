import frappe
from frappe import _ 
import requests
import json
import http.client
from myojana.apis.html_to_image import create_image
from frappe.utils import get_site_name
def format_mobile_number(mobile):
    # Remove any leading '+' sign
    if mobile.startswith('+'):
        mobile = mobile[1:]
    
    # Check if the mobile number starts with the country code for India (91)
    if mobile.startswith('91') and len(mobile) > 10:
        mobile = mobile[2:]
    
    # Ensure the mobile number is 10 digits long
    if len(mobile) == 10 and mobile.isdigit():
        return mobile
    else:
        raise ValueError("Invalid mobile number format")
@frappe.whitelist()
def test_auth_key(auth_key):
    conn = http.client.HTTPSConnection("control.msg91.com")
    headers = {
        'accept': "application/json",
        'authkey': auth_key
        }
    conn.request("GET", "/api/v5/whatsapp/whatsapp-activation/", headers=headers)

    res = conn.getresponse()
    response_str = res.read().decode("utf-8")  # Read and decode the response
    response_json = json.loads(response_str)   # Convert the string to a JSON object
    return response_json


@frappe.whitelist()
def send_id(doc):
    template_name, auth_key , integrated_number = frappe.db.get_value('mYojana Settings', None, ['id_card_template', 'auth_key' ,'integrated_number'])

    print("template_name",auth_key)
    if not auth_key:
        frappe.throw(_("Please set Auth Key in mYojana Settings"))

    if not template_name:
        frappe.throw(_("Please set ID Card Template in mYojana Settings"))

    file,doc = create_image(doc, template_name)
    conn = http.client.HTTPSConnection("api.msg91.com")
    payload = json.dumps({
        "integrated_number": integrated_number,
        "content_type": "template",
        "payload": {
            "messaging_product": "whatsapp",
            "type": "template",
            "template": {
                "name": "beneficiary_profile_id",
                "language": {
                    "code": "en",
                    "policy": "deterministic"
                },
                "namespace": None,
                "to_and_components": [{
                    "to": [
                        f"91{format_mobile_number(doc.contact_number)}"
                    ],
                    "components": {
                        "header_1": {
                            "type": "image",
                            "value": f"{frappe.local.request.scheme}://{frappe.local.request.host}{file.file_url}"
                        },
                        "body_1": {
                            "type": "text",
                            "value": f"{doc.name_of_the_beneficiary}"
                        }
                    }
                }]
            }
        }
    })
    # return payload
    # print(payload)
    headers = {
        'Content-Type': 'application/json',
        'authkey': auth_key
    }
    conn.request("POST", "/api/v5/whatsapp/whatsapp-outbound-message/bulk/", payload, headers)
    res = conn.getresponse()
    data = res.read()
    print(data.decode("utf-8"))
    return data.decode("utf-8")

@frappe.whitelist()
def send(phoneNo):
    whatsapp = frappe.conf.get('whatsapp')
    message = '%7B%22type%22%3A%22text%22%2C%22text%22%3A%22Hi%20Sir%2FMadam%20Ji%5Cn%5CnNamaskar!%5Cn%5CnAap%20apna%20organization%20ID%20yaha%20dekh%20sakte%20hai.%20Kripya%20isko%20star%20mark%20karke%20save%20kar%20lijiye.%5Cn%5CnRegards%5CnJanpahal%22%7D'
    message_old = '%7B%22type%22%3A%22text%22%2C%22text%22%3A%22Congratulations!%20%F0%9F%8E%89%20Your%20loan%20application%20has%20been%20applied%20successfully!%20%F0%9F%92%B0%E2%9C%85%5Cn%5CnBest%20Regards%5CnGov%5Cn%5Cn%22%7D'
    payload = f"channel=whatsapp&source={whatsapp.get('source')}&destination=91{phoneNo}&message={message_old}&src.name={whatsapp.get('src.name')}"
    headers = {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/x-www-form-urlencoded',
        'apikey': whatsapp.get('apikey'),
        'cache-control': 'no-cache'
    }
    conn = http.client.HTTPSConnection("api.gupshup.io")
    conn.request("POST", "/wa/api/v1/msg", payload, headers)
    res = conn.getresponse()
    data = res.read()
    print("///////////////////////////////////////////////////////", data)
    return json.loads(data.decode("utf-8"))
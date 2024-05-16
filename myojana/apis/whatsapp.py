import frappe
import requests
import json
import http.client
@frappe.whitelist()
def send():
    phone = "918308623995"
    whatsapp = frappe.conf.get('whatsapp')
    payload = f"channel=whatsapp&source={whatsapp.get('source')}&destination={phone}&message=%7B%22type%22%3A%22text%22%2C%22text%22%3A%22Congratulations!%20%F0%9F%8E%89%20Your%20loan%20application%20has%20been%20applied%20successfully!%20%F0%9F%92%B0%E2%9C%85%5Cn%5CnBest%20Regards%5CnGov%5Cn%5Cn%22%7D&src.name={whatsapp.get('src.name')}"
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
    return json.loads(data.decode("utf-8"))
import frappe
import requests
import json
import http.client
@frappe.whitelist()
def send(phoneNo):
    # print("imgData",phoneNo,imgDataUrl)
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
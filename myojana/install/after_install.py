from myojana.utils.after_install import AfterInstall
from myojana.utils.generate_master_data import Gen_Master_Data

state_json = [
 {
  "docstatus": 0,
  "doctype": "State",
  "name": "S01",
  "state_code": "S01",
  "state_name": "Jammu & Kashmir"
 },
 {
  "docstatus": 0,
  "doctype": "State",
  "name": "S02",
  "state_code": "S02",
  "state_name": "Himachal Pradesh"
 },
 {
  "docstatus": 0,
  "doctype": "State",
  "name": "S03",
  "state_code": "S03",
  "state_name": "Punjab"
 },
 {
  "docstatus": 0,
  "doctype": "State",
  "name": "S04",
  "state_code": "S04",
  "state_name": "Chandigarh"
 },
 {
  "docstatus": 0,
  "doctype": "State",
  "name": "S05",
  "state_code": "S05",
  "state_name": "Uttarakhand"
 }
]

def update_myojana_settings():
    AfterInstall.set_app_name()
    AfterInstall.set_brand_logo()
    AfterInstall.set_favicons()
    AfterInstall.set_navbar_logo()
    AfterInstall.set_navbar_setting()
    AfterInstall.set_splash_image()
    AfterInstall.set_website_logo()


def gen_master_data(state="State",state_json=state_json):
    Gen_Master_Data.create_data(state,state_json)
    # print("////////////////////////////////////////////////", "After")

app_name = "myojana"
app_title = "myojana"
app_publisher = "dhwaniris"
app_description = "social inclusion program management system"
app_email = "teach@suvaidyam.com"
app_license = "mit"
# required_apps = ["Suvaidyam/sva_dashboard"]

fixtures = [
    # "mYojana Settings",
    # "Report List",
    # "SVA Report"
    # "scheme application submitted",
    # "Scheme Paid by",
    # "Client Script",
    # "Custom HTML Block",
    # "Caste category",
    # "Religion",
    # "Education",
    # "Marital status",
    # "Social vulnerable category",
    # "PWD master",
    # "ID Document",
    # "Occupation",
    # "Occupational Category",
    # "Role Profile",
    # "Source Of Information",
    # "House Types",
    # "Gender",
    # "Role",
    # "Name of the Department",
    # "State",
    # "District",
    # "Block",
    # "Village",
    # "Scheme",
    # "Camp",
    # "Proof of Disability",
    # "Milestone category",
    # "Centre",
    # "Sub Centre",

]
# Includes in <head>
# ------------------
permission_query_conditions = {
    # "Sub Centre":"myojana.middlewares.sub_centre.list_query",
    # "Myojana User":"myojana.middlewares.myojana_users.list_query",
    "Role Profile":"myojana.middlewares.role_profile.list_query",
    # "User":"myojana.middlewares.user.list_query",
    # "Centre":"myojana.middlewares.centre.list_query",
}

# include js, css files in header of desk.html
app_include_css = "/assets/myojana/css/main.css"
app_include_js = [
    "/assets/myojana/js/main.js",
    "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
]

# include js, css files in header of web template
# web_include_css = "/assets/myojana/css/myojana.css"
# web_include_js = "/assets/myojana/js/myojana.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "myojana/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
doctype_js = {
    "Beneficiary Profiling" : [
        "public/js/utils/utils.js" ,
        "public/js/beneficiary_profiling/beneficiary_profiling.js",
        "public/js/beneficiary_profiling/follow_up.js",
        "public/js/beneficiary_profiling/scheme.js",
        "public/js/beneficiary_profiling/id_document.js",
    ],
    "Sub Centre":[
        "public/js/utils/utils.js"
    ],
    "mYojana Settings":[
        "public/js/utils/utils.js"
    ],
    "Scheme":"public/js/scheme/eligibile_ben.js"
}
# doctype_js = {"Beneficiary Profiling" : }
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Svg Icons
# ------------------
# include app icons in desk
# app_include_icons = "myojana/public/images/mYojana.png"

# Home Pages
# ----------
# override_whitelisted_methods = {
# 	"frappe.desk.reportview.get_count": "myojana.apis.override_method.get_count",
# 	"frappe.desk.reportview.get": "myojana.apis.override_method.get"
# }
# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
#	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
#	"methods": "myojana.utils.jinja_methods",
#	"filters": "myojana.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "myojana.install.before_install"
# after_install = ["myojana.install.after_install.update_myojana_settings"]

# Uninstallation
# ------------

# before_uninstall = "myojana.uninstall.before_uninstall"
# after_uninstall = "myojana.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "myojana.utils.before_app_install"
# after_app_install = "myojana.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "myojana.utils.before_app_uninstall"
# after_app_uninstall = "myojana.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "myojana.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
#	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
#	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
#	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events

doc_events = {
	"*": {
		# "on_update": "myojana.scheduler_events.ben_dob_update.update_dob_of_ben",
		# "on_cancel": "myojana.scheduler_events.ben_dob_update.update_dob_of_ben",
		# "on_trash": "myojana.scheduler_events.ben_dob_update.update_dob_of_ben"
	},
    #  "Beneficiary Profiling": {
    #     "on_update": "myojana.middlewares.test.test",
    # }
}

# Scheduled Tasks
# ---------------

scheduler_events = {
#	"all": [
#		"myojana.tasks.all"
#	],
	"daily": [
        "myojana.scheduler_events.ben_dob_update.update_age",
        # "myojana.scheduler_events.ben_dob_update.update_dob_of_ben",
        # "myojana.scheduler_events.ben_dob_update.update_dob_months"
	],
#	"hourly": [
#		"myojana.tasks.hourly"
#	],
#	"weekly": [
#		"myojana.tasks.weekly"
#	],
#	"monthly": [
#		"myojana.tasks.monthly"
#	],
}

# Testing
# -------

# before_tests = "myojana.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
#	"frappe.desk.doctype.event.event.get_events": "myojana.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
#	"Task": "myojana.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

ignore_links_on_delete = ["Beneficiary Profiling", "Family" , "Route History"]

# Request Events
# ----------------
# before_request = ["myojana.utils.before_request"]
# after_request = ["myojana.utils.after_request"]

# Job Events
# ----------
# before_job = ["myojana.utils.before_job"]
# after_job = ["myojana.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
#	{
#		"doctype": "{doctype_1}",
#		"filter_by": "{filter_by}",
#		"redact_fields": ["{field_1}", "{field_2}"],
#		"partial": 1,
#	},
#	{
#		"doctype": "{doctype_2}",
#		"filter_by": "{filter_by}",
#		"partial": 1,
#	},
#	{
#		"doctype": "{doctype_3}",
#		"strict": False,
#	},
#	{
#		"doctype": "{doctype_4}"
#	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
#	"myojana.auth.validate"
# ]

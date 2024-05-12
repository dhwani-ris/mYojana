# Copyright (c) 2023, suvaidyam and contributors
# For license information, please see license.txt

import frappe
from myojana.utils.report_filter import ReportFilter

def execute(filters=None):
	# frappe.errprint(filters)
	columns = [
		{
		"fieldname":"name_of_the_scheme",
		"label":"Bank account status of Beneficiaries",
		"fieldtype":"Data",
		"width":300
		},
		{
		"fieldname":"status",
		"label":"Count",
		"fieldtype":"int",
		"width":200
		}
	]
	condition_str = ReportFilter.set_report_filters(filters, 'creation', True)
	if condition_str:
		condition_str = f"AND {condition_str}"
	else:
		condition_str = ""
	
	sql_query = f"""
	SELECT
		name_of_the_scheme , count(parent) as status  FROM `tabScheme Child` where status = "Completed"
	"""

	data = frappe.db.sql(sql_query, as_dict=True)
	return columns, data
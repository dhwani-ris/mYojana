# Copyright (c) 2023, suvaidyam and contributors
# For license information, please see license.txt

import frappe
from myojana.utils.report_filter import ReportFilter

def execute(filters=None):
	# frappe.errprint(filters)
	columns = [
		{
		"fieldname":"gender",
		"label":"Gender",
		"fieldtype":"Data",
		"width":300
		},
		{
		"fieldname":"count",
		"label":"Count",
		"fieldtype":"int",
		"width":200
		}
	]
	condition_str = ReportFilter.set_report_filters(filters, 'creation', True)
	if condition_str:
		condition_str = f"WHERE {condition_str}"
	else:
		condition_str = ""
	
	sql_query = f"""
		SELECT
			COALESCE(NULLIF(gender, ''), 'Unknown') as gender,
			COUNT(*) as count
		FROM
			`tabBeneficiary Profiling`
		{condition_str}
		GROUP BY
			COALESCE(NULLIF(gender, ''), 'Unknown');
	"""
	data = frappe.db.sql(sql_query, as_dict=True)
	return columns, data
# Copyright (c) 2023, suvaidyam and contributors
# For license information, please see license.txt

import frappe
from sipms.utils.report_filter import ReportFilter

def execute(filters=None):
	# frappe.errprint(filters)
	columns = [
		{
			"fieldname":"state",
			"label":"State",
			"fieldtype":"Data",
			"width":400
		},
		{
			"fieldname":"count",
			"label":"Count",
			"fieldtype":"int",
			"width":200
		}
	]

	condition_str = ReportFilter.set_report_filters(filters, 'date_of_visit', True, 't1')
	if condition_str:
		condition_str = f"AND {condition_str}"
	else:
		condition_str = ""

	sql_query = f"""
		SELECT
			COALESCE(t2.state_name, 'Unknown') as state,
			COUNT(CASE WHEN t1.state_of_origin IS NULL OR t1.state_of_origin = '' THEN 'Unknown' ELSE t1.state_of_origin END) as count
		FROM
			`tabBeneficiary Profiling` AS t1
		LEFT JOIN
			`tabState` AS t2 ON t1.state_of_origin = t2.name
		WHERE
			1=1 {condition_str}
		GROUP BY
			COALESCE(t2.state_name, 'Unknown');
	"""


	data = frappe.db.sql(sql_query, as_dict=True)

	return columns, data

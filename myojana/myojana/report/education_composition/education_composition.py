# Copyright (c) 2023, suvaidyam and contributors
# For license information, please see license.txt

import frappe
from myojana.utils.report_filter import ReportFilter

def execute(filters=None):
	# frappe.errprint(filters)
	columns = [
		{
			"fieldname":"education",
			"label":"Education of beneficiary",
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
    COALESCE(NULLIF(t1.education, ''), 'Unknown') AS education,
		COUNT(t1.name) AS count
	FROM
		`tabBeneficiary Profiling` AS t1
	LEFT JOIN
		`tabEducation` AS t2 ON t1.education = t2.name
	WHERE
		1=1 {condition_str}
	GROUP BY
    COALESCE(NULLIF(t1.education, ''), 'Unknown');

	"""

	data = frappe.db.sql(sql_query, as_dict=True)
	return columns, data

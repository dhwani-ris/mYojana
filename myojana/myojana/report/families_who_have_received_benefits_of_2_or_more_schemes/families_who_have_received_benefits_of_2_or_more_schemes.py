# Copyright (c) 2024, dhwaniris and contributors
# For license information, please see license.txt

# import frappe


import frappe
from myojana.utils.report_filter import ReportFilter

def execute(filters=None):
	# frappe.errprint(filters)
	columns = [
		{
		"fieldname":"n",
		"label":"No. of members",
		"fieldtype":"int",
		"width":200
		},
		{
		"fieldname":"count",
		"label":"No. distinct Families",
		"fieldtype":"int",
		"width":200
		}
	]
	condition_str = ReportFilter.set_report_filters(filters, 'date_of_visit', True, 'bp')
	if condition_str:
		condition_str = f"AND {condition_str}"
	else:
		condition_str = ""

	sql_query = f"""
			SELECT
			'Number of Families' AS n,
				COUNT(*) as count
			FROM
			(SELECT
				bp.select_primary_member,
				COUNT(bp.select_primary_member) AS scheme_count
			FROM
				`tabBeneficiary Profiling` bp
			RIGHT JOIN
				`tabScheme Child` sc ON bp.name = sc.parent
			WHERE
				1=1 {condition_str}
			GROUP BY
				bp.select_primary_member
			HAVING
				scheme_count >= 2)
			AS
				counts;
		"""

	data = frappe.db.sql(sql_query, as_dict=True)
	return columns, data

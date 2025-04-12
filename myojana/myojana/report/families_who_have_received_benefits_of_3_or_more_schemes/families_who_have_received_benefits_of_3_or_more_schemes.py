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
	condition_str = ReportFilter.set_report_filters(filters, 'date_of_visit', True, 'ben')
	if condition_str:
		condition_str = f"AND {condition_str}"
	else:
		condition_str = ""
	
	sql_query = f"""
			SELECT
				'Number of members' AS n,
				COUNT(t.select_primary_member) AS count
			FROM
				(
					SELECT
						ben.select_primary_member,
						COUNT(ben.select_primary_member) AS sc_count
					FROM
						"tabBeneficiary Profiling" AS ben
					INNER JOIN "tabScheme Child" sc ON (sc.parent = ben.name AND sc.status = 'Completed')
					WHERE 1=1 {condition_str}
					GROUP BY ben.select_primary_member
					HAVING COUNT(ben.select_primary_member) >= 3
				) as t
		"""

	data = frappe.db.sql(sql_query, as_dict=True)
	return columns, data

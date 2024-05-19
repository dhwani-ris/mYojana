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
		"label":"No. distinct member",
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
		'Number of members' AS n,
		COUNT(*) AS count
	FROM
		(SELECT
			sc.parent,
			COUNT(sc.parent) AS ben_count
		FROM 
			`tabScheme Child` sc
		WHERE
			sc.parent 
		IN (
			SELECT
				name 
			FROM 
				`tabBeneficiary Profiling` 
			WHERE 
				1=1 {condition_str})
		GROUP BY
			sc.parent
		) AS counts
	WHERE
		counts.ben_count >= 3;
	"""

	data = frappe.db.sql(sql_query, as_dict=True)
	print("///////", data)
	return columns, data

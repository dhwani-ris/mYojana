# Copyright (c) 2023, suvaidyam and contributors
# For license information, please see license.txt

import frappe
from myojana.utils.report_filter import ReportFilter

def execute(filters=None):
	# frappe.errprint(filters)
	columns = [
		{
		"fieldname":"name_of_the_scheme",
		"label":"Name of the scheme",
		"fieldtype":"Data",
		"width":300
		},
		{
		"fieldname":"ben_count",
		"label":"No. distinct member",
		"fieldtype":"int",
		"width":200
		},
		{
		"fieldname":"family_count",
		"label":"No. distinct family",
		"fieldtype":"int",
		"width":200
		}
	]
	condition_str = ReportFilter.set_report_filters(filters, 'creation', True)
	if condition_str:
		condition_str = f"AND {condition_str}"
	else:
		condition_str = ""
	
	sql_query = f"""SELECT
    sc.name_of_the_scheme,
    COUNT(DISTINCT sc.parent) as ben_count,
	COUNT(DISTINCT bp.select_primary_member) as family_count
	FROM 
		`tabScheme Child` sc
	INNER JOIN 
		`tabBeneficiary Profiling` bp ON sc.parent = bp.name 
	WHERE 
		sc.status = 'Completed'
	GROUP BY
		sc.name_of_the_scheme
	"""
	print(sql_query)
	data = frappe.db.sql(sql_query, as_dict=True)
	return columns, data
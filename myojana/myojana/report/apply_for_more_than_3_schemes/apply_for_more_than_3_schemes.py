# Copyright (c) 2024, dhwaniris and contributors
# For license information, please see license.txt

# import frappe


import frappe
from myojana.utils.report_filter import ReportFilter

def execute(filters=None):
	# frappe.errprint(filters)
	columns = [
		{
		"fieldname":"name_of_the_beneficiary",
		"label":"Name of the beneficiary",
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
		bp.name_of_the_beneficiary,
		COUNT(DISTINCT sc.parent) AS ben_count,
		COUNT(DISTINCT bp.select_primary_member) AS family_count
	FROM 
		`tabScheme Child` sc
	INNER JOIN 
		`tabBeneficiary Profiling` bp ON sc.parent = bp.name
	GROUP BY
		bp.name_of_the_beneficiary
	HAVING
		COUNT(sc.parent) >= 3
	"""

	data = frappe.db.sql(sql_query, as_dict=True)
	return columns, data

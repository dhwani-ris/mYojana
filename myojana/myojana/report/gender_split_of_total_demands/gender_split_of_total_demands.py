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
		"width":200
		},
		{
		"fieldname":"ben_count",
		"label":"Beneficiary Count",
		"fieldtype":"int",
		"width":200
		},
		
		{
		"fieldname":"open_count",
		"label":"Open",
		"fieldtype":"Data",
		"width":200
		},
		{
		"fieldname":"completed_count",
		"label":"Completed",
		"fieldtype":"Data",
		"width":200
		},
		{
		"fieldname":"under_process_count",
		"label":"Under Process",
		"fieldtype":"Data",
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
		COUNT(ben.name) AS ben_count,
		ben.gender,
		SUM(CASE WHEN s.status = 'Open' THEN 1 ELSE 0 END) AS open_count,
		SUM(CASE WHEN s.status = 'Completed' THEN 1 ELSE 0 END) AS completed_count,
		SUM(CASE WHEN s.status = 'Under Process' THEN 1 ELSE 0 END) AS under_process_count
	FROM 
		`tabBeneficiary Profiling` AS ben
	LEFT JOIN `tabScheme Child` AS s 
		ON ben.name = s.parent 
	WHERE 
		s.milestone_category = 'Citizenship Entitlement' AND s.status IN ('Open','Completed','Under Process') 
		{condition_str}
	GROUP BY  
		ben.gender;
	"""
	data = frappe.db.sql(sql_query, as_dict=True)
	return columns, data
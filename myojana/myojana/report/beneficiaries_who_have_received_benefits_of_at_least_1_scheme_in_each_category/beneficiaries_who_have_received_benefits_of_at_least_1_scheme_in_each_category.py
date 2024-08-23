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
		"label":"No. of beneficiaries",
		"fieldtype":"int",
		"width":200
		},
		{
		"fieldname":"count",
		"label":"No. distinct beneficiaries",
		"fieldtype":"int",
		"width":200
		}
	]
	condition_str = ReportFilter.set_report_filters(filters, 'creation', True,'bp')
	if condition_str:
		condition_str = f"AND {condition_str}"
	else:
		condition_str = ""

	distinct_milestone = frappe.db.sql("select count(distinct milestone) as count from `tabScheme` where enabled = '1'", as_dict=True)
	mcount = distinct_milestone[0].count if len(distinct_milestone) > 0 else 0
	query = f"""
		select 
			*
		from
			(
				select 
					'Number of beneficiaries' as n,
					(count(distinct milestone)) = {mcount} as count
				from
					`tabScheme Child`
				INNER JOIN  `tabBeneficiary Profiling` bp on bp.name = parent
				where 
					parenttype = 'Beneficiary Profiling' and parentfield = 'scheme_table'  {condition_str} 
				group by parent
			) as t
		where t.count = 1
	"""
	print(query)
	ben_data = frappe.db.sql(query, as_dict=True)
	return columns, ben_data

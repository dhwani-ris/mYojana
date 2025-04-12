# Copyright (c) 2024, dhwaniris and contributors
# For license information, please see license.txt

# import frappe


import frappe
from frappe import _
from myojana.utils.report_filter import ReportFilter

def execute(filters=None):
	# frappe.errprint(filters)
	columns = [
		{
		"fieldname":"n",
		"label":_("No. of beneficiaries"),
		"fieldtype":"int",
		"width":200
		},
		{
		"fieldname":"count",
		"label":_("No. distinct beneficiaries"),
		"fieldtype":"int",
		"width":200
		}
	]
	condition_str = ReportFilter.set_report_filters(filters, 'creation', True,'bp')
	if condition_str:
		condition_str = f"AND {condition_str}"
	else:
		condition_str = ""

	milestones = frappe.db.sql("SELECT DISTINCT milestone as milestone FROM `tabScheme` WHERE enabled = 1", as_dict=True)	
	mcount = len(milestones)
	milestones = [f"'{m['milestone']}'" for m in milestones]
	query =f"""
		SELECT 
   			COUNT(t.name) as count,
			'Number of beneficiaries' as n
		FROM
			(
			SELECT
				COUNT(DISTINCT s.milestone),
				bp.name
			from
				`tabScheme Child` as s
			INNER JOIN  `tabBeneficiary Profiling` bp ON bp.name = parent
			WHERE 
				s.parenttype = 'Beneficiary Profiling' and s.parentfield = 'scheme_table'  {condition_str} 
				AND s.milestone_category IN ({','.join(milestones)})
			GROUP BY bp.name
			HAVING COUNT(DISTINCT s.milestone) = {mcount}
			) AS t
	"""
	ben_data = frappe.db.sql(query, as_dict=True)
	return columns, ben_data

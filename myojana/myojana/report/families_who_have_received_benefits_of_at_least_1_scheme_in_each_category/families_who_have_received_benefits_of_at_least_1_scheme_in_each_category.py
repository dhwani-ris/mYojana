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
		"label":_("No. of families"),
		"fieldtype":"int",
		"width":200
		},
		{
		"fieldname":"count",
		"label":_("No. distinct families"),
		"fieldtype":"int",
		"width":200
		}
	]
	condition_str = ReportFilter.set_report_filters(filters, 'date_of_visit', True, 'bp')
	if condition_str:
		condition_str = f"AND {condition_str}"
	else:
		condition_str = ""

	milestones = frappe.db.sql("select distinct milestone as milestone from `tabScheme` where enabled = 1", as_dict=True)	
	mcount = len(milestones)
	milestones = [f"'{m['milestone']}'" for m in milestones]
	query =f"""
		SELECT 
			COUNT(t.select_primary_member) as count,
			'Number of beneficiaries' as n
		FROM
			(
			SELECT
				COUNT(DISTINCT s.milestone),
				bp.select_primary_member
			FROM
				`tabScheme Child` as s
			INNER JOIN  `tabBeneficiary Profiling` bp ON bp.name = s.parent 
			WHERE 
				s.parenttype = 'Beneficiary Profiling' AND s.parentfield = 'scheme_table' {condition_str}
				AND s.milestone_category IN ({','.join(milestones)})
			GROUP BY bp.select_primary_member
			HAVING COUNT(DISTINCT s.milestone) = {mcount}
			) AS t
	"""
	ben_data = frappe.db.sql(query, as_dict=True)
	return columns, ben_data

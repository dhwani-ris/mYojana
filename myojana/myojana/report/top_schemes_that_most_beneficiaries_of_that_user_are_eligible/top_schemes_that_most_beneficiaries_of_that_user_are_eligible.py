# Copyright (c) 2023, suvaidyam and contributors
# For license information, please see license.txt

import frappe
from myojana.utils.misc import Misc
def execute(filters=None):
	# frappe.errprint(filters)
	columns = [
		{
			"fieldname":"scheme",
			"label":"Scheme",
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

	# filter_condition_str = ReportFilter.set_report_filters(filters, 'date_of_visit', True, 't1')
	get_all_scheame = frappe.db.sql(f"select name  from `tabScheme`", as_dict=True)
	scheme_ben_count_list =[]
	for scheme in get_all_scheame:
			conditions = []
			rule_cond_str = Misc.scheme_rules_to_condition(scheme.name)
			if rule_cond_str:
				conditions.append(rule_cond_str)
			# if filter_condition_str:
			# 	conditions.append(filter_condition_str)
			get_elegible_ben = f"""
				SELECT
					count(name) as count
				FROM
					`tabBeneficiary Profiling`
				{('WHERE '+' AND '.join(conditions)) if len(conditions) else ""}
			"""
			
			ben_result = frappe.db.sql(get_elegible_ben, as_dict=True)
			scheme_ben_count_list.append({"scheme": scheme.name , "count": (ben_result[0].count if len(ben_result) else 0)})
	sorted_schemes = sorted(scheme_ben_count_list, key=lambda x: x["count"], reverse=True)
		# Get the top 5 schemes
	top_5_schemes = sorted_schemes[:5]
		# data = frappe.db.sql(sql_query, as_dict=True)

	return columns, top_5_schemes

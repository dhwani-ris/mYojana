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
		"label":_("No. of members"),
		"fieldtype":"int",
		"width":200
		},
		{
		"fieldname":"count",
		"label":_("No. distinct member"),
		"fieldtype":"int",
		"width":200
		}
	]
	condition_str = ReportFilter.set_report_filters(filters, 'creation', True,'ben')
	if condition_str:
		condition_str = f"AND {condition_str}"
	else:
		condition_str = ""
	
	sql_query = f"""
		 SELECT
            'Number of members' AS n,
            COUNT(t.name) AS count
        FROM
            (
                SELECT
                    ben.name,
                    COUNT(sc.name) AS sc_count
                FROM
                    "tabBeneficiary Profiling" AS ben
                INNER JOIN "tabScheme Child" sc ON (sc.parent = ben.name AND sc.status = 'Completed')
                WHERE 1=1 {condition_str}
                GROUP BY ben.name
                HAVING COUNT(sc.name) >= 3
            ) as t;
	"""

	data = frappe.db.sql(sql_query, as_dict=True)
	return columns, data

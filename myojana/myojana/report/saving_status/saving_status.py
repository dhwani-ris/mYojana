# Copyright (c) 2023, suvaidyam and contributors
# For license information, please see license.txt

import frappe
from myojana.utils.report_filter import ReportFilter

def execute(filters=None):
	# frappe.errprint(filters)
	columns = [
		{
		"fieldname":"bank_account",
		"label":"Saving status",
		"fieldtype":"Data",
		"width":300
		},
		{
		"fieldname":"count",
		"label":"Count",
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
    	CASE
        	WHEN COALESCE(custom_saving_status, '') = '' THEN 'Unknown'
        	ELSE custom_saving_status
    	END AS bank_account,
    		COUNT(custom_saving_status) AS count
	FROM
    	`tabBeneficiary Profiling`
		WHERE
			custom_saving_status IS NOT NULL {condition_str}
		GROUP BY
			custom_saving_status;
	"""

	data = frappe.db.sql(sql_query, as_dict=True)
	return columns, data
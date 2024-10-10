# Copyright (c) 2023, suvaidyam and contributors
# For license information, please see license.txt

import frappe
from myojana.utils.report_filter import ReportFilter


def execute(filters=None):
    columns = [
        {
            "fieldname": "location",
            "label": "Current Location",
            "fieldtype": "Data",
            "width": 150,

        },
        {
            "fieldname": "count",
            "label": "count",
            "fieldtype": "Data",
            "width": 160,
        },
    ]

    condition_str = ReportFilter.set_report_filters(filters, 'date_of_visit', True , 'ben_table')
    if condition_str:
        condition_str = f"AND {condition_str}"
    else:
        condition_str = ""

    sql_query = f"""
    SELECT 
		cl.name_of_location AS location, 
		COUNT(ben.name) AS count
	FROM 
		`tabBeneficiary Profiling` AS ben
	LEFT JOIN 
		`tabCurrent location` AS cl 
		ON cl.name = ben.custom_current_location
    WHERE 1=1 {condition_str}
	GROUP BY 
		cl.name
	ORDER BY 
		Count DESC
"""


    data = frappe.db.sql(sql_query, as_dict=True)
    return columns, data

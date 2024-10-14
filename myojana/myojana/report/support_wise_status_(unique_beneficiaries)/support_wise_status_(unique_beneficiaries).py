# Copyright (c) 2023, suvaidyam and contributors
# For license information, please see license.txt

import frappe
from myojana.utils.report_filter import ReportFilter


def execute(filters=None):
    columns = [
        {
            "fieldname": "milestone_category",
            "label": "Scheme Type",
            "fieldtype": "Data",
            "width": 200,
            
        },
        {
            "fieldname": "applied",
            "label": "Applied",
            "fieldtype": "Data",
            "width": 130,
        },
        {
            "fieldname": "comp_count",
            "label": "Application Completed",
            "fieldtype": "Data",
            "width": 130,
        }
    ]

    condition_str = ReportFilter.set_report_filters(filters, 'date_of_visit', True , 'bp')
    if condition_str:
        condition_str = f"AND {condition_str}"
    else:
        condition_str = ""

    sql_query = f"""
		SELECT
			sc.milestone_category as milestone_category,
			COUNT(DISTINCT sc.parent) AS applied,
			SUM(CASE WHEN sc.status = 'Completed' THEN 1 ELSE 0 END) AS comp_count
		FROM (
			SELECT DISTINCT parent, milestone_category, status
			FROM `tabScheme Child`
		) AS sc
		LEFT JOIN `tabBeneficiary Profiling` AS bp ON sc.parent = bp.name
		WHERE 1=1 {condition_str}
		GROUP BY
			sc.milestone_category
		ORDER BY
			sc.milestone_category
"""


    data = frappe.db.sql(sql_query, as_dict=True)
    return columns, data

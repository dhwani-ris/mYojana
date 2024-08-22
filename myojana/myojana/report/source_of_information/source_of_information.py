# Copyright (c) 2023, suvaidyam and contributors
# For license information, please see license.txt

import frappe
from myojana.utils.report_filter import ReportFilter


def execute(filters=None):
    columns = [
        {
            "fieldname": "source_of_information",
            "label": "Source of Information",
            "fieldtype": "Data",
            "width": 400
        },
        {
            "fieldname": "count",
            "label": "Count",
            "fieldtype": "int",
            "width": 200
        }
    ]
    condition_str = ReportFilter.set_report_filters(filters, 'date_of_visit', True,)
    if condition_str:
        condition_str = f"WHERE {condition_str}"
    else:
        condition_str = "1=1"
    # print("condition_str", condition_str)
    sql_query = f"""
    SELECT
        COALESCE(NULLIF(source_of_information, ''), 'Unknown') as source_of_information,
        COUNT(name) AS count
    FROM
        `tabBeneficiary Profiling`
    {condition_str}
    GROUP BY
        COALESCE(NULLIF(source_of_information, ''), 'Unknown');
"""
    
    data = frappe.db.sql(sql_query, as_dict=True)
    return columns, data

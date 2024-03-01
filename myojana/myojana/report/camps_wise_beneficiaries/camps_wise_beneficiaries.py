# Copyright (c) 2023, suvaidyam and contributors
# For license information, please see license.txt

import frappe
from sipms.utils.report_filter import ReportFilter


def execute(filters=None):
    columns = [
        {
            "fieldname": "camp",
            "label": "Camp",
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
        condition_str = f"{condition_str}"
    else:
        condition_str = "1=1"
    print("condition_str", condition_str)
    sql_query = f"""
    SELECT
        name_of_the_camp as camp,
        COUNT(name) AS count
    FROM
        `tabBeneficiary Profiling`
    WHERE {condition_str} AND name_of_the_camp IS NOT NULL AND name_of_the_camp != ''
    GROUP BY
        name_of_the_camp
"""
    
    data = frappe.db.sql(sql_query, as_dict=True)
    return columns, data

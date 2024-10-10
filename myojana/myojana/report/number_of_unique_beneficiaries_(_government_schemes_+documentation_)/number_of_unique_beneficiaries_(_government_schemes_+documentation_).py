# Copyright (c) 2023, suvaidyam and contributors
# For license information, please see license.txt

import frappe
from myojana.utils.report_filter import ReportFilter


def execute(filters=None):
    columns = [
        {
            "fieldname": "milestone_category",
            "label": "Support Category",
            "fieldtype": "Data",
            "width": 200,
            
        },
        {
            "fieldname": "total_demands",
            "label": "Total Unique Demands",
            "fieldtype": "Data",
            "width": 130,
        }
    ]

    condition_str = ReportFilter.set_report_filters(filters, 'date_of_visit', True , 'ben_table')
    if condition_str:
        condition_str = f"AND {condition_str}"
    else:
        condition_str = ""

    sql_query = f"""
    SELECT
        milestone_category,
        COUNT(DISTINCT ben_table.name) AS total_demands
    FROM
        `tabScheme Child` as _sc
    INNER JOIN `tabBeneficiary Profiling` as ben_table on (ben_table.name =  _sc.parent and _sc.parenttype ='Beneficiary Profiling')
    WHERE
        1=1 {condition_str} AND milestone_category IN ("Documentation","Government schemes") AND _sc.status = 'Completed';
"""


    data = frappe.db.sql(sql_query, as_dict=True)
    return columns, data

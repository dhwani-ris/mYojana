# Copyright (c) 2023, suvaidyam and contributors
# For license information, please see license.txt

import frappe
from myojana.utils.report_filter import ReportFilter


def execute(filters=None):
    columns = [
        {
            "fieldname": "scheme",
            "label": "Scheme ",
            "fieldtype": "Data",
            "width": 200,
            
        },
        {
            "fieldname": "milestone",
            "label": "Milestone",
            "fieldtype": "Data",
            "width": 200,

        },
        {
            "fieldname": "total_demands",
            "label": "Total Demands",
            "fieldtype": "Data",
            "width": 130,
        },
        {
            "fieldname": "open_demands",
            "label": "Open Demands",
            "fieldtype": "Data",
            "width": 130,
        },
        {
            "fieldname": "submitted_demands",
            "label": "Submitted Demands",
            "fieldtype": "Data",
            "width": 160,
        },
        {
            "fieldname": "completed_demands",
            "label": "Completed Demands",
            "fieldtype": "Data",
            "width": 170,
        },
        {
            "fieldname": "rejected_demands",
            "label": "Rejected Demands",
            "fieldtype": "Data",
            "width": 130,
        },
        {
            "fieldname": "closed_demands",
            "label": "Closed Demands",
            "fieldtype": "Data",
            "width": 130,
        },
    ]

    condition_str = ReportFilter.set_report_filters(filters, 'date_of_visit', True , 'ben_table')
    if condition_str:
        condition_str = f"AND {condition_str}"
    else:
        condition_str = ""

    sql_query = f"""
    SELECT
        scheme,
        milestone,
        SUM(CASE WHEN (_sc.status = 'Open') THEN 1 ELSE 0 END) as open_demands,
        SUM(CASE WHEN (_sc.status = 'Completed') THEN 1 ELSE 0 END) as completed_demands,
        SUM(CASE WHEN (_sc.status = 'Closed') THEN 1 ELSE 0 END) as closed_demands,
        SUM(CASE WHEN (_sc.status = 'Under process') THEN 1 ELSE 0 END) as submitted_demands,
        SUM(CASE WHEN (_sc.status = 'Rejected') THEN 1 ELSE 0 END) as rejected_demands,
        COUNT(_sc.status) as total_demands
    FROM
        `tabScheme Child` as _sc
    INNER JOIN `tabBeneficiary Profiling` as ben_table on (ben_table.name =  _sc.parent and _sc.parenttype ='Beneficiary Profiling')
    WHERE
        1=1 {condition_str}
    GROUP BY
        scheme;
"""


    data = frappe.db.sql(sql_query, as_dict=True)
    return columns, data

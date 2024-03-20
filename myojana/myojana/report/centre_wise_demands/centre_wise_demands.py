# Copyright (c) 2023, suvaidyam and contributors
# For license information, please see license.txt

import frappe
from myojana.utils.report_filter import ReportFilter


def execute(filters=None):
    columns = [
        {
            "fieldname": "centre_name",
            "label": " Centre Name ",
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
        }
    ]

    condition_str = ReportFilter.set_report_filters(filters, 'date_of_visit', True , 'bp')
    condition_str = f"WHERE {condition_str}" if condition_str else ""

    sql_query = f"""
SELECT
    tw.centre_name,
    SUM(CASE WHEN (sc.status = 'Open') THEN 1 ELSE 0 END) as open_demands,
    SUM(CASE WHEN (sc.status = 'Completed') THEN 1 ELSE 0 END) as completed_demands,
    SUM(CASE WHEN (sc.status = 'Closed') THEN 1 ELSE 0 END) as closed_demands,
    SUM(CASE WHEN (sc.status = 'Under process') THEN 1 ELSE 0 END) as submitted_demands,
    SUM(CASE WHEN (sc.status = 'Rejected') THEN 1 ELSE 0 END) as rejected_demands,
    COUNT(sc.status) as total_demands
FROM
    `tabBeneficiary Profiling` bp
LEFT JOIN
    `tabScheme Child` sc ON bp.name = sc.parent
LEFT JOIN
    `tabCentre` tw ON bp.centre = tw.name
{condition_str}
GROUP BY
   tw.centre_name;
"""


    data = frappe.db.sql(sql_query, as_dict=True)
    return columns, data
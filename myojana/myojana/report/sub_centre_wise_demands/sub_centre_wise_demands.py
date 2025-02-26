# Copyright (c) 2023, suvaidyam and contributors
# For license information, please see license.txt

import frappe
from myojana.utils.report_filter import ReportFilter


def execute(filters=None):
    columns = [
        {
            "fieldname": "user",
            "label": "User",
            "fieldtype": "Data",
            "width": 200,

        },
        {
            "fieldname": "sub_centre_name",
            "label": "Sub Centre Name",
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
    condition_str = f"{condition_str}" if condition_str else "1=1"

    sql_query = f"""
    SELECT
        sc.modified_by AS user,
        COALESCE(hd.sub_centre_name, 'Unknown') AS sub_centre_name,
        SUM(CASE WHEN sc.status = 'Open' THEN 1 ELSE 0 END) AS open_demands,
        SUM(CASE WHEN sc.status = 'Completed' THEN 1 ELSE 0 END) AS completed_demands,
        SUM(CASE WHEN sc.status = 'Closed' THEN 1 ELSE 0 END) AS closed_demands,
        SUM(CASE WHEN sc.status = 'Under process' THEN 1 ELSE 0 END) AS submitted_demands,
        SUM(CASE WHEN sc.status = 'Rejected' THEN 1 ELSE 0 END) AS rejected_demands,
        COUNT(sc.status) AS total_demands
    FROM
        "tabBeneficiary Profiling" bp
    LEFT JOIN
        "tabScheme Child" sc ON bp.name = sc.parent
    LEFT JOIN
        "tabSub Centre" hd ON bp.sub_centre = hd.name 
    WHERE
        {condition_str}
    GROUP BY
        sc.modified_by, COALESCE(hd.sub_centre_name, 'Unknown');


    """



    data = frappe.db.sql(sql_query, as_dict=True)
    return columns, data
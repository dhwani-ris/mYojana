# Copyright (c) 2023, suvaidyam and contributors
# For license information, please see license.txt

import frappe
from myojana.utils.report_filter import ReportFilter


def execute(filters=None):
    if filters.milestone:
        child_filter = f"""_sc.milestone = '{filters['milestone']}'"""
        del filters['milestone']
    else:
        child_filter = "1=1"
    print(filters.milestone)
    # return print(filters)
    columns = [
        {
            "fieldname": "milestone",
            "label": "Support category",
            "fieldtype": "Data",
            "width": 150,

        },
        {
            "fieldname": "scheme",
            "label": "Support Name",
            "fieldtype": "Data",
            "width": 200,
            
        },
        {
            "fieldname": "total_demands",
            "label": "No. of enquiries received",
            "fieldtype": "Data",
            "width": 200,
        },
        {
            "fieldname": "completed_demands",
            "label": "Achieved",
            "fieldtype": "Data",
            "width": 170,
        },
        {
            "fieldname": "rejected_demands",
            "label": "Rejected",
            "fieldtype": "Data",
            "width": 130,
        },
        {
            "fieldname": "pending_count",
            "label": "Pending",
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
        _sc.modified_by as user,
        _sc.scheme,
        _sc.milestone,
        SUM(CASE WHEN (_sc.status = 'Open') THEN 1 ELSE 0 END) as open_demands,
        SUM(CASE WHEN (_sc.status = 'Completed') THEN 1 ELSE 0 END) as completed_demands,
        SUM(CASE WHEN (_sc.status = 'Rejected') THEN 1 ELSE 0 END) as rejected_demands,
        SUM(CASE WHEN (_sc.status IN ('','Under process','Open')) THEN 1 ELSE 0 END) as pending_count,
        COUNT(_sc.name) as total_demands
    FROM
        `tabScheme Child` as _sc
    INNER JOIN `tabBeneficiary Profiling` as ben_table on (ben_table.name =  _sc.parent and _sc.parenttype ='Beneficiary Profiling')
    WHERE
        1=1 {condition_str} AND {child_filter}
    GROUP BY
        _sc.scheme
"""


    data = frappe.db.sql(sql_query, as_dict=True)
    return columns, data

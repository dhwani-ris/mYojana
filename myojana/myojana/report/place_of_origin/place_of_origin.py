# Copyright (c) 2023, suvaidyam and contributors
# For license information, please see license.txt

import frappe
from myojana.utils.report_filter import ReportFilter


def execute(filters=None):
    columns = [
        {
            "fieldname": "state",
            "label": "State",
            "fieldtype": "Data",
            "width": 200
        },
        {
            "fieldname": "district",
            "label": "District",
            "fieldtype": "Data",
            "width": 200
        },
        {
            "fieldname": "block",
            "label": "Block",
            "fieldtype": "Data",
            "width": 200
        },
        {
            "fieldname": "count",
            "label": "Count",
            "fieldtype": "int",
            "width": 200
        }
    ]
    condition_str = ReportFilter.set_report_filters(filters, 'date_of_visit', True, 'b')
    if condition_str:
        condition_str = f"{condition_str}"
    else:
        condition_str = "1=1"

    sql_query = f"""
        SELECT
            COALESCE(NULLIF(s.state_name, ''), 'Unknown') AS state,
            COALESCE(NULLIF(d.district_name, ''), 'Unknown') AS district,
            COALESCE(NULLIF(bl.block_name, ''), 'Unknown') AS block,
            COUNT(b.name) AS count
        FROM
            `tabBeneficiary Profiling` AS b
            LEFT JOIN tabState AS s ON b.state_of_origin = s.name
            LEFT JOIN tabDistrict AS d ON b.district_of_origin = d.name
            LEFT JOIN tabBlock as bl ON b.ward = bl.name
        WHERE {condition_str}
        GROUP BY
            COALESCE(NULLIF(b.state_of_origin, ''), 'Unknown'), COALESCE(NULLIF(b.district_of_origin, ''), 'Unknown') , COALESCE(NULLIF(b.ward, ''), 'Unknown')
        ORDER BY
            COALESCE(NULLIF(b.state_of_origin, ''), 'Unknown'), COALESCE(NULLIF(b.district_of_origin, ''), 'Unknown');
    """
    data = frappe.db.sql(sql_query, as_dict=True)
    return columns, data

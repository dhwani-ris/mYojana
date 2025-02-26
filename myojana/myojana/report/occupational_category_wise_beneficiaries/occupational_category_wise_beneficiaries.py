# Copyright (c) 2023, suvaidyam and contributors
# For license information, please see license.txt
import frappe
from myojana.utils.report_filter import ReportFilter

def execute(filters=None):
    columns = [
        {
            "fieldname": "occupation",
            "label": "Occupation category",
            "fieldtype": "Data",
            "width": 200
        },
        {
            "fieldname": "number_of_beneficiaries",
            "label": "Number Of beneficiaries",
            "fieldtype": "Int",
            "width": 300
        }
    ]

    condition_str = ReportFilter.set_report_filters(filters, 'date_of_visit', True)

    if condition_str:
        condition_str = f"WHERE {condition_str}"
    else:
        condition_str = ""

    sql_query = f"""
        SELECT
            COALESCE(occupational_category, 'Unknown') AS occupation,
            COUNT(name) AS number_of_beneficiaries
        FROM
            `tabBeneficiary Profiling`
        {condition_str}
        GROUP BY
            COALESCE(occupational_category, 'Unknown')
        ORDER BY number_of_beneficiaries DESC
    """


    data = frappe.db.sql(sql_query, as_dict=True)
    return columns, data

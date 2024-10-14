import frappe
from myojana.utils.report_filter import ReportFilter

def execute(filters=None):
    columns = [
        {
            "fieldname": "caste_category",
            "label": "Caste",
            "fieldtype": "Link",
            "options": "Caste category",
            "width": 200
        },
        {
            "fieldname": "occupation",
            "label": "Occupation",
            "fieldtype": "Link",
            "options": "Occupation",
            "width": 300
        },
        {
            "fieldname": "count",
            "label": "Count",
            "fieldtype": "int",
            "width": 200
        }
    ]

    condition_str = ReportFilter.set_report_filters(filters, 'date_of_visit', True, 'ben')
    if condition_str:
        condition_str = f"AND {condition_str}"
    else:
        condition_str = ""

    sql_query = f"""
        SELECT
			ben.caste_category as caste_category,
            ben.current_occupation as occupation,
            COUNT(ben.name) as count
        FROM
            `tabBeneficiary Profiling` as ben
        WHERE
        1=1 {condition_str}
        GROUP BY
            caste_category , occupation
		ORDER BY caste_category ASC, occupation ASC
    """

    data = frappe.db.sql(sql_query, as_dict=True)
    return columns, data

import frappe
from sipms.utils.report_filter import ReportFilter

def execute(filters=None):
    columns = [
        {
            "fieldname": "application_submitted",
            "label": "Application Submitted",
            "fieldtype": "Data",
            "width": 400,
        },
        {
            "fieldname": "count",
            "label": "Count",
            "fieldtype": "Int",
            "width": 200
        }
    ]

    condition_str = ReportFilter.set_report_filters(filters, 'date_of_visit', True)
    if condition_str:
        condition_str = f"AND {condition_str}"
    else:
        condition_str = ""

    sql_query = f"""
        SELECT
            application_submitted,
            COUNT(name) as count
        FROM
            `tabScheme Child`
        WHERE
            status = 'Completed'
            AND application_submitted = 'Yes'
        {condition_str}
        GROUP BY
            application_submitted
    """

    data = frappe.db.sql(sql_query, as_dict=True)
    return columns, data
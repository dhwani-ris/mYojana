import frappe
from myojana.utils.report_filter import ReportFilter

def execute(filters=None):
    columns = [
        {
            "fieldname": "status",
            "label": "Current status",
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

    condition_str = ReportFilter.set_report_filters(filters, 'date_of_visit', True, 'ben_table')
    if condition_str:
        condition_str = f"AND {condition_str}"
    else:
        condition_str = ""

    sql_query = f"""
        SELECT
            _sc.status,
            COUNT(_sc.name) as count
        FROM
            `tabScheme Child` as _sc
        INNER JOIN `tabBeneficiary Profiling` as ben_table on (ben_table.name =  _sc.parent and _sc.parenttype ='Beneficiary Profiling')
        WHERE
            _sc.status = 'Under Process' AND
        1=1 {condition_str}
        GROUP BY
            _sc.application_submitted
    """

    data = frappe.db.sql(sql_query, as_dict=True)
    return columns, data

import frappe
from myojana.utils.report_filter import ReportFilter

def execute(filters=None):
    columns = [
        {
            "fieldname": "current_status",
            "label": "Current status",
            "fieldtype": "Data",
            "width": 400,
        },
        {
            "fieldname": "status",
            "label": "Count",
            "fieldtype": "Int",
            "width": 400,
        },

    ]

    condition_str = ReportFilter.set_report_filters(filters, 'date_of_visit', True, 'ben_table')
    if condition_str:
        condition_str = f"AND {condition_str}"
    else:
        condition_str = ""

    sql_query = f"""
        SELECT
            _sc.status as current_status,
            COUNT(_sc.status) as status
        FROM
            `tabScheme Child` as _sc
        INNER JOIN `tabBeneficiary Profiling` as ben_table on (ben_table.name =  _sc.parent and _sc.parenttype ='Beneficiary Profiling')
        WHERE
            _sc.status IS NOT NULL AND _sc.status != '' {condition_str}
        GROUP BY
            _sc.status;
    """

    data = frappe.db.sql(sql_query, as_dict=True)
    return columns, data

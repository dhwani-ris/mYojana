import frappe
from frappe import _
from myojana.utils.report_filter import ReportFilter

def execute(filters=None):
    columns = [
        {
            "fieldname": "application_submitted",
            "label": _("Application Submitted"),
            "fieldtype": "Data",
            "width": 400
        },
        {
            "fieldname": "count",
            "label": _("Count"),
            "fieldtype": "Int",
            "width": 200
        }
    ]

    condition_str = ReportFilter.set_report_filters(filters, 'creation', True)
    if condition_str:
        condition_str = f"AND {condition_str}"
    else:
        condition_str = ""

    sql_query = f"""
        SELECT
            _sc.application_submitted,
            COUNT(_sc.name) as count
        FROM
            `tabScheme Child` as _sc
        INNER JOIN `tabBeneficiary Profiling` as ben_table on (ben_table.name =  _sc.parent and _sc.parenttype ='Beneficiary Profiling')
        WHERE
            ((_sc.application_submitted = 'No' AND _sc.status = 'Open')
            OR (_sc.application_submitted = 'Yes' AND _sc.status = 'Under process'))
            {condition_str}
        GROUP BY
            _sc.application_submitted;
    """
    data = frappe.db.sql(sql_query, as_dict=True)
    return columns, data

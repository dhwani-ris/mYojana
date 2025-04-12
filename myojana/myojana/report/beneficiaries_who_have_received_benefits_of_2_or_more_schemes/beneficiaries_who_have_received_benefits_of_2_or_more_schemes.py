import frappe
from frappe import _
from myojana.utils.report_filter import ReportFilter

def execute(filters=None):
    columns = [
        {
            "fieldname": "n",
            "label": _("No. of members"),
            "fieldtype": "Data",  # Note: 'Int' should be properly capitalized
            "width": 200
        },
        {
            "fieldname": "count",
            "label": _("No. distinct member"),
            "fieldtype": "Int",
            "width": 200
        }
    ]

    # Set the report filters
    condition_str = ReportFilter.set_report_filters(filters, 'creation', True, 'ben')
    
    if condition_str:
        condition_str = f"WHERE {condition_str}"
    else:
        condition_str = ""

    # SQL Query
    sql_query = f"""
        SELECT
            'Number of members' AS n,
            COUNT(t.name) AS count
        FROM
            (
                SELECT
                    ben.name,
                    COUNT(sc.name) AS sc_count
                FROM
                    "tabBeneficiary Profiling" AS ben
                INNER JOIN "tabScheme Child" sc ON (sc.parent = ben.name AND sc.status = 'Completed')
                {condition_str}
                GROUP BY ben.name
                HAVING COUNT(sc.name) >= 2
            ) as t;
    """
    data = frappe.db.sql(sql_query, as_dict=True)
    return columns, data

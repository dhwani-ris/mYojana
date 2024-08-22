import frappe
from myojana.utils.report_filter import ReportFilter

def execute(filters=None):
    columns = [
        {
            "fieldname": "n",
            "label": "No. of members",
            "fieldtype": "Int",  # Note: 'Int' should be properly capitalized
            "width": 200
        },
        {
            "fieldname": "count",
            "label": "No. distinct member",
            "fieldtype": "Int",
            "width": 200
        }
    ]

    # Set the report filters
    condition_str = ReportFilter.set_report_filters(filters, 'creation', True, '')
    condition_str = ReportFilter.set_report_filters(filters, 'creation', True, 'b')
    
    if condition_str:
        condition_str = f"WHERE {condition_str}"
    else:
        condition_str = ""

    # SQL Query
    sql_query = f"""
        SELECT
            'Number of members' AS n,
            COUNT(*) AS count
        FROM
            (SELECT
                sc.parent,
                COUNT(sc.parent) AS ben_count
            FROM
                `tabScheme Child` sc
            WHERE
                sc.parent IN (
                    SELECT
                        name
                    FROM
                        `tabBeneficiary Profiling` AS b
                    {condition_str}
                )
            GROUP BY
                sc.parent
            ) AS counts
        WHERE
            counts.ben_count >= 2;
    """

    # Execute the SQL query
    data = frappe.db.sql(sql_query, as_dict=True)

    # Return columns and data
    return columns, data

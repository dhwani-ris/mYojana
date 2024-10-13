# Copyright (c) 2023, suvaidyam and contributors
# For license information, please see license.txt

import frappe
from myojana.utils.report_filter import ReportFilter


def execute(filters=None):
    columns = [
        {
            "fieldname": "milestone",
            "label": "Support Category",
            "fieldtype": "Data",
            "width": 200,

        },
        {
            "fieldname": "count",
            "label": "Count",
            "fieldtype": "Int",
            "width": 130,
        }
    ]                 
    

    condition_str = ReportFilter.set_report_filters(filters, 'date_of_visit', True , 'c')
    condition_str = condition_str.replace("c.centre", "c.custom_centre")
    condition_str = f"WHERE {condition_str}" if condition_str else ""

    sql_query = f"""
	SELECT cc.support_category as milestone , SUM(cc.number_of_participants) as count  
	FROM `tabCamp` AS c
	INNER JOIN `tabCamp Form Child` AS cc ON cc.parent = c.name
    {condition_str} 
    Group by cc.support_category;
    """


    data = frappe.db.sql(sql_query, as_dict=True)
    return columns, data
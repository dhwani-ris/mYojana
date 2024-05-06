# Copyright (c) 2023, Management System for Agrasarteach@suvaidyam.com and contributors
# For license information, please see license.txt

import frappe
# from sva_report.utils.filter import Filter
from report.utils.doc_type_info import DocTypeInfo

@frappe.whitelist()
def execute(doc,filters=[],skip=0, limit=10,csv_export=0,debug=None):
    # print("doc",doc)
    res= DocTypeInfo.get_data('SVA Report',doc, filters,skip, limit,csv_export, debug )
    return res
@frappe.whitelist()
def get_fields(doc):
    # res = DocTypeInfo.get_data('SVA Report',doc, filters,skip, limit,csv_export, debug )
    res = DocTypeInfo.get_fields(doc,[])
    return res
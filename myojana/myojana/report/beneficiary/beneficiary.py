# Copyright (c) 2023, Management System for Agrasarteach@suvaidyam.com and contributors
# For license information, please see license.txt

import frappe
from myojana.utils.filter import Filter

allowed_types = ['Data', 'Int', 'Select', 'Check']
child_types = ['Table', 'Table MultiSelect']

def get_fields(doc_type,fields,parent_field="", degree=1,link_table=None, child_table=None):
    if parent_field:
        parent_field = f"{parent_field}."
    ref_doc_meta = frappe.get_meta(doc_type)
    for field in ref_doc_meta.fields:
        local_field = {"label": field.label,"fieldtype": field.fieldtype,"fieldname": f"{field.fieldname}","options": field.options}
        if field.fieldtype in allowed_types:
            fields.append({
                "doc_type":doc_type,
                "label": field.label,
                "fieldtype": field.fieldtype,
                "fieldname": f"{parent_field}{field.fieldname}",
                "options": field.options,
                "link_table":link_table,
                "child_table":child_table
            })
        elif field.fieldtype == 'Link':
            if degree == 1:
                new_parent_field = field.fieldname
                if parent_field:
                    new_parent_field = f"{parent_field}{field.fieldname}"
                link_fields = get_fields(field.options,fields, new_parent_field, 2, local_field, child_table)

        elif field.fieldtype in child_types:
            local_field['parenttype'] = doc_type
            get_fields(field.options,fields,field.fieldname,1,child_table=local_field)

    return fields

# print(results)



def execute(filters=None):
    doc_name = 'Beneficiary'
    report_doc = frappe.get_doc('Report', doc_name)
    fields = get_fields(report_doc.ref_doctype,[], parent_field="")
    base_tbl = f"`tab{doc_name}`"
    joins = []
    unique_link_table = []
    unique_child_table = []
    unique_child_link_table = []
    for field in fields:
        if field.get('child_table') is None and field.get('link_table'):
            tbl_name = f"`tab{field.get('link_table').get('options')}`"
            lnk_fieldname = f"{field.get('link_table').get('fieldname')}"
            if lnk_fieldname not in unique_link_table:
                joins.append(f"LEFT JOIN {tbl_name} as {lnk_fieldname} ON {lnk_fieldname}.`name` = {base_tbl}.{lnk_fieldname}")
                unique_link_table.append(lnk_fieldname)
        elif field.get('child_table') and field.get('link_table') is None:
            tbl_name = f"`tab{field.get('child_table').get('options')}`"
            lnk_fieldname = f"{field.get('child_table').get('fieldname')}"
            if lnk_fieldname not in unique_child_table:
                joins.append(f"LEFT JOIN {tbl_name} as {lnk_fieldname} ON {lnk_fieldname}.`parent` = {base_tbl}.name")
                unique_child_table.append(lnk_fieldname)
        elif field.get('child_table') and field.get('link_table'):
            tbl_name_ = f"`tab{field.get('child_table').get('options')}`"
            lnk_fieldname_ = f"{field.get('child_table').get('fieldname')}"
            if lnk_fieldname_ not in unique_child_table:
                joins.append(f"LEFT JOIN {tbl_name_} as {lnk_fieldname_} ON {lnk_fieldname_}.`parent` = {base_tbl}.name")
                unique_child_table.append(lnk_fieldname_)

            tbl_name = f"`tab{field.get('link_table').get('options')}`"
            lnk_fieldname = f"{field.get('link_table').get('fieldname')}"
            if lnk_fieldname not in unique_child_link_table:
                joins.append(f"LEFT JOIN {tbl_name} as {lnk_fieldname} ON {lnk_fieldname}.`name` = {lnk_fieldname_}.{lnk_fieldname}")
                unique_child_link_table.append(lnk_fieldname)
    join_str = '\n'.join(joins)
    columns = []
    for field in fields:
        if len(field.get('fieldname').split('.')) == 3:
            columns.append(f"{field.get('fieldname').split('.')[1]}.{field.get('fieldname').split('.')[2]} as `{field.get('label')}`")
        elif len(field.get('fieldname').split('.')) == 2:
            columns.append(f"{field.get('fieldname')} as `{field.get('label')}`")
        elif len(field.get('fieldname').split('.')) == 1:
            columns.append(f"{base_tbl}.{field.get('fieldname')} as `{field.get('label')}`")
    columns_str = ',\n'.join(columns)
    query = f"""
        select
            {columns_str}
        from
            {base_tbl}
        {join_str}
    """
    results = frappe.db.sql(query, as_dict=True)


    return [{
        "label":field.get('label'),
        "fieldname":field.get('label'),
        "fieldtype":field.get('fieldtype'),
        "options":field.get('options')
        } for field in fields], results, None

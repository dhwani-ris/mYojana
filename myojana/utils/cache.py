import frappe
import ast

class  Cache:
    def dict_to_sql_where_clause(conditions, tables = None, op="AND"):
        """
        Convert a dictionary to an SQL WHERE clause with OR conditions.

        :param conditions: A dictionary containing conditions in the form of {'key': ['value1', 'value2', ...], ...}
        :return: A string representing the SQL WHERE clause with OR conditions.
        """
        where_clauses = []

        for key, values in conditions.items():
            # Check if there's only one value for the current key
            if len(values) == 1:
                # Create a condition for the single value
                where_clauses.append(f"{key} = '{values[0]}'")
            else:
                # Create an IN condition for multiple values
                val = [f"'{value}'" for value in values]
                if(tables):
                    in_clause = f"{tables+'.'+key} IN ({', '.join(val)})"
                else:
                    in_clause = f"{key} IN ({', '.join(val)})"
                where_clauses.append(in_clause)

        # Combine all conditions with OR
        where_clause = f" {op} ".join(where_clauses)

        return where_clause

    def get_user_permission(cond_str=True,table=None):
        usr = frappe.session.user
        # getting myojan setting and mapping of state and district
        mapper_docs = frappe.db.sql("""
                SELECT
                    doctypes , field_name
                FROM `tabSetting Doctype Child`
            """,as_dict=True)
        # print("myojana_setting_child:",myojana_setting_child)
        mapperObj = {}
        for doc in mapper_docs:
            mapperObj[doc.doctypes] = doc.field_name
        # getting the list of user permission list
        permission_list = frappe.db.get_list('User Permission',
            filters={
                'user': usr
            },
            fields=['allow', 'for_value'],
            ignore_permissions=True
        )
        # print("permission_list",permission_list)
        conditions = {}
        for doc in permission_list:
            if mapperObj[doc.allow] is not None:
                # print(mapperObj[doc.allow])
                if conditions.get(mapperObj[doc.allow], None) is not None:
                    conditions[mapperObj[doc.allow]].append(f"{doc.for_value}")
                else:
                    conditions[mapperObj[doc.allow]] = [f"{doc.for_value}"]
        new_conditions = {}
        if cond_str:
            new_conditions = Cache.dict_to_sql_where_clause(conditions, table)
        else:
            for field_name in conditions:
                new_conditions[field_name] = ["IN",conditions[field_name]]

        print("new_conditions:",new_conditions)
        return new_conditions
import frappe
import ast
import frappe

class Cache:
    @staticmethod
    def dict_to_sql_where_clause(conditions, table_name=None, op="AND"):
        """
        Convert a dictionary to an SQL WHERE clause with AND conditions.

        :param conditions: A dictionary containing conditions in the form of {'key': ['value1', 'value2', ...], ...}
        :return: A string representing the SQL WHERE clause with AND conditions.
        """
        where_clauses = []

        for key, values in conditions.items():
            # Check if there's only one value for the current key
            if len(values) == 1:
                # Create a condition for the single value
                if table_name:
                    where_clauses.append(f"{table_name}.{key} = '{values[0]}'")
                else:
                    where_clauses.append(f"{key} = '{values[0]}'")
            else:
                # Create an IN condition for multiple values
                val = [f"'{value}'" for value in values]
                if table_name:
                    in_clause = f"{table_name}.{key} IN ({', '.join(val)})"
                else:
                    in_clause = f"{key} IN ({', '.join(val)})"
                where_clauses.append(in_clause)

        # Combine all conditions with AND
        where_clause = f" {op} ".join(where_clauses)

        return where_clause

    @staticmethod
    def get_user_permission(cond_str=True, table=None):
        usr = frappe.session.user
        # Getting myojana setting and mapping of state and district
        mapper_docs = frappe.db.sql("""
            SELECT
                doctypes, field_name
            FROM `tabSetting Doctype Child`
        """, as_dict=True)

        mapperObj = {}
        for doc in mapper_docs:
            mapperObj[doc.doctypes] = doc.field_name

        # Getting the list of user permission list
        permission_list = frappe.db.get_list('User Permission',
                                             filters={'user': usr},
                                             fields=['allow', 'for_value'],
                                             ignore_permissions=True)

        conditions = {}
        for doc in permission_list:
            if doc.allow in mapperObj:
                field_name = mapperObj[doc.allow]
                if field_name is not None:
                    if field_name in conditions:
                        conditions[field_name].append(f"{doc.for_value}")
                    else:
                        conditions[field_name] = [f"{doc.for_value}"]
            else:
                # Log or handle the case where doc.allow is not in mapperObj
                print(f"Warning: '{doc.allow}' key is missing in mapperObj")

        new_conditions = {}
        if cond_str:
            new_conditions = Cache.dict_to_sql_where_clause(conditions, table)
        else:
            for field_name in conditions:
                new_conditions[field_name] = ["IN", conditions[field_name]]

        return new_conditions

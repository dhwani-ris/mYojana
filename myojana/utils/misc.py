import frappe

class Misc:
    @staticmethod
    def rules_to_filters(rules, obj=False):
        filters = []
        if rules is not None and len(rules):
            groups = {}
            for rule in rules:
                if groups.get(rule.group) is None:
                    groups[rule.group] = [
                        [rule.rule_field, rule.operator, f"{rule.data}"]
                    ]
                else:
                    groups[rule.group].append([rule.rule_field, rule.operator, f"{rule.data}"])
            if obj:
                return groups
            for key in groups.keys():
                filters.append(groups[key])
        return filters
    @staticmethod
    def create_condition(rules=[], queries_groups=False):
        conditions = []
        if rules is not None and len(rules):
            groups = {}
            gIndex = 0
            for rule in rules:
                # if not rule.group:
                #     gIndex += 1
                #     groups[f"G{gIndex}"] = [f"{rule.rule_field} {rule.operator} '{rule.data}'"]
                if groups.get(rule.group) is None:
                    groups[rule.group] = [f"{rule.rule_field} {rule.operator} '{rule.data}'"]
                else:
                    groups[rule.group].append(f"{rule.rule_field} {rule.operator} '{rule.data}'")
            for key in groups.keys():
                conditions.append(f"({' AND '.join(groups[key])})")
        if queries_groups:
            return conditions
        return f"({' OR '.join(conditions)})" if len(conditions) else ""
    @staticmethod
    def scheme_rules_to_condition(scheme, queries_groups=False):
        """
        Converts scheme rules into SQL conditions.

        Args:
            scheme (str): Name of the scheme.
            queries_groups (bool, optional): If True, returns conditions grouped by queries. Defaults to False.

        Returns:
            str or list: SQL conditions or grouped conditions based on the queries_groups flag.
        """
        sql = f"""
            select
                _tsc.rule_field,
                _tsc.operator,
                _tsc.data,
                _tsc.code,
                _tsc.group
            from
                `tabScheme` as _ts
            inner join `tabRule Engine Child` as _tsc on (_tsc.parent = _ts.name and _tsc.parenttype = 'Scheme')
            where
                _ts.name_of_the_scheme = %s
        """
        rules = frappe.db.sql(sql, (scheme), as_dict=True)
        return Misc.create_condition(rules, queries_groups)

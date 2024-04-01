import frappe
from myojana.utils.misc import Misc
class BeneficaryScheme:
    def run(beneficiary=None):
        schemes = frappe.get_list('Scheme', fields=['name', 'name_of_department', 'milestone'])
        for scheme in schemes:
            doc = frappe.get_doc("Scheme", scheme.name)
            rule_list = []
            matching_counter = 0
            if doc.rules and len(doc.rules):
                filters = Misc.rules_to_filters(doc.rules,True)
                for group in filters:
                    sql_query = ' AND '.join([f"{condition[0]} {condition[1]} {condition[2]}" for condition in filters[group]])
                    filter = filters[group]
                    filter.append(['name','=',beneficiary])
                    beneficiary_list = frappe.get_list("Beneficiary Profiling", filters=filter,page_length=1)
                    check = True if len(beneficiary_list) else False
                    if check:
                        matching_counter += 1
                    rule_list.append({
                        'message':f"[{group if group else ''}]:({sql_query})",
                        'check':check
                    })
            scheme['rules'] = rule_list

            scheme['total_rules'] = len(rule_list)
            scheme['matching_rules'] = matching_counter
            scheme['matching_rules_per'] = 0
            if matching_counter > 0:
                scheme['matching_rules_per'] = (matching_counter/scheme['total_rules'])*100
        return schemes
    def validate(beneficiary, condition):
        list = frappe.get_list("Beneficiary Profiling", filters=[condition,['name','=',beneficiary]],page_length=1)
        return True if len(list) > 0 else False

    def validate_conditions(beneficiary, key, conditions):
        obj = {'total':len(conditions), 'matched':0, 'percentage':0,'rules':[],'key':key}
        for condition in conditions:
            is_matched = BeneficaryScheme.validate(beneficiary, condition)
            if is_matched:
                obj['matched'] += 1
            obj['rules'].append({
                'message':f"{condition[0]} {condition[1]} {condition[2]}",
                'matched':is_matched
            })
        obj['percentage'] = ((obj['matched']/obj['total'])*100) if obj['total'] > 0 else 0
        return obj
    def has_availed(beneficiary, scheme):
        sql = f"""
        select
            name
        from
            `tabScheme Child`
        where
            parent = '{beneficiary}'
            and
            parenttype='Beneficiary Profiling'
            and
            name_of_the_scheme = '{scheme}'
            and
            status IN ('Completed','Availed')
        limit 1
        """
        count_list = frappe.db.sql(sql, as_dict=True)
        return False if len(count_list) else True

    def get_schemes(beneficiary=None):
        schemes = frappe.get_list('Scheme', fields=['name', 'name_of_department', 'milestone', 'how_many_times_can_this_scheme_be_availed'],  filters={'enabled': '1'})
        for scheme in schemes:
            doc = frappe.get_doc("Scheme", scheme.name)
            scheme['groups'] = []
            scheme['available'] = True
            if scheme.get('how_many_times_can_this_scheme_be_availed') == 'Once':
                scheme['available'] = BeneficaryScheme.has_availed(beneficiary, scheme.name)
            scheme['rules'] = []
            scheme['total_rules'] = 0
            scheme['matching_rules'] = 0
            scheme['matching_rules_per'] = 0
            if doc.rules and len(doc.rules):
                filters = Misc.rules_to_filters(doc.rules,True)
                groups = []
                for key in filters:
                    groups.append(BeneficaryScheme.validate_conditions(beneficiary,key,filters[key]))
                denominator_sorted_list = sorted(groups, key=lambda x: x['total'], reverse=True)
                percentage_sorted_list = sorted(denominator_sorted_list, key=lambda x: x['percentage'], reverse=True)

                scheme['groups'] = percentage_sorted_list
                scheme['rules'] = percentage_sorted_list[0]['rules'] if len(percentage_sorted_list)>0 else []
                scheme['total_rules'] = percentage_sorted_list[0]['total'] if len(percentage_sorted_list)>0 else 0
                scheme['matching_rules'] = percentage_sorted_list[0]['matched'] if len(percentage_sorted_list)>0 else 0
                scheme['matching_rules_per'] = 0
                if scheme['matching_rules'] > 0:
                    scheme['matching_rules_per'] = ((scheme['matching_rules']/scheme['total_rules'])*100)
        res_schemes_denominator_sort = sorted(schemes, key=lambda x: x.get('total_rules', 0), reverse=True)
        res_schemes = sorted(res_schemes_denominator_sort, key=lambda x: x.get('matching_rules_per', 0), reverse=True)
        return res_schemes

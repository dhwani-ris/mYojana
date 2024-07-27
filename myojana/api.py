import frappe
from myojana.services.beneficiary_scheme import BeneficaryScheme
from myojana.utils.misc import Misc
# from myojana.utils.filter import Filter
from myojana.utils.report_filter import ReportFilter

import json

@frappe.whitelist(allow_guest=True)
def get_mYojana_settings():
    return frappe.get_doc('mYojana Settings')

@frappe.whitelist(allow_guest=True)
def get_installed_apps():
    installed_apps = frappe.get_installed_apps()
    return installed_apps

def create_condition(scheme, _tbl_pre=""):
    if isinstance(scheme, str):
        raise "No rules"
    user_role_filter = ReportFilter.set_report_filters()
    cond_str = Misc.create_condition(scheme.rules)
    filters = []
    if cond_str:
        filters.append(cond_str)
    if user_role_filter:
        filters.append(user_role_filter)
    return " WHERE  1=1 "+ (f"AND {' AND '.join(filters)}" if len(filters) else "")

def get_beneficiary_scheme_query(scheme_doc,start=0,page_limit=1000,filters=[]):
    availed_sql = f""
    if scheme_doc.get('how_many_times_can_this_scheme_be_availed') == 'Once':
        availed_sql = f"""
            AND name not in (
                select
                    distinct parent
                from
                    `tabScheme Child`
                where
                    parenttype='Beneficiary Profiling'
                    and
                    name_of_the_scheme = '{scheme_doc.name}'
                    and
                    status IN ('Completed','Availed')
            )
        """
    condition = create_condition(scheme_doc)
    filter_condition = ""
    ward_filter = ""
    primary_member_filter= ""
    pm_join_type  = "LEFT JOIN"
    ward_join_type  = "LEFT JOIN"
    if len(filters):
        for filter_item in json.loads(filters):  # Convert filters from string to list
            filter_key = list(filter_item.keys())[0]
            filter_value = list(filter_item.values())[0]
            if filter_key == 'name_of_the_beneficiary':
                filter_condition += f" AND {filter_key} LIKE '{filter_value}%'"
            elif filter_key == 'contact_number':
                filter_condition += f" AND {filter_key} LIKE '%{filter_value}%'"
            elif filter_key == 'block_name':
                ward_filter += f" AND block_name LIKE '{filter_value}%'"
                ward_join_type = "INNER JOIN"
            elif filter_key == 'name_of_parents':
                primary_member_filter += f" AND name_of_parents LIKE '{filter_value}%'"
                pm_join_type = "INNER JOIN"
            else:
                pm_join_type = "LEFT JOIN"
                ward_join_type = "LEFT JOIN"


    sql = f"""
            SELECT
                _ben.*,
                _pm.name_of_parents AS name_of_parents,
                _bl.block_name AS block_name,
                _vl.village_name AS village_name
            FROM
                (SELECT * FROM `tabBeneficiary Profiling` {condition} {availed_sql} {filter_condition if filter_condition else ''}) AS _ben
            {pm_join_type} `tabPrimary Member` _pm ON _pm.name = _ben.select_primary_member {primary_member_filter}
            {ward_join_type} `tabBlock` _bl ON _bl.name = _ben.ward {ward_filter}
            LEFT JOIN `tabVillage` _vl ON _vl.name = _ben.name_of_the_settlement
            ORDER BY select_primary_member DESC
            LIMIT {page_limit} OFFSET {start}
    """
    return sql

def get_total_beneficiary_count_query(scheme_doc , start=0,page_limit=1000,filters=[]):
    availed_sql = f""
    if scheme_doc.get('how_many_times_can_this_scheme_be_availed') == 'Once':
        availed_sql = f"""
            AND name not in (
                select
                    distinct parent
                from
                    `tabScheme Child`
                where
                    parenttype='Beneficiary Profiling'
                    and
                    name_of_the_scheme = '{scheme_doc.name}'
                    and
                    status IN ('Completed','Availed')
            )
        """
    condition = create_condition(scheme_doc)
    filter_condition = ""
    ward_filter = ""
    primary_member_filter= ""
    pm_join_type  = "LEFT JOIN"
    ward_join_type  = "LEFT JOIN"
    if len(filters):
        for filter_item in json.loads(filters):  # Convert filters from string to list
            filter_key = list(filter_item.keys())[0]
            filter_value = list(filter_item.values())[0]
            if filter_key == 'name_of_the_beneficiary':
                filter_condition += f" AND {filter_key} LIKE '{filter_value}%'"
            elif filter_key == 'contact_number':
                filter_condition += f" AND {filter_key} LIKE '%{filter_value}%'"
            elif filter_key == 'block_name':
                ward_filter += f" AND block_name LIKE '{filter_value}%'"
                ward_join_type = "INNER JOIN"
            elif filter_key == 'name_of_parents':
                primary_member_filter += f" AND name_of_parents LIKE '{filter_value}%'"
                pm_join_type = "INNER JOIN"
            else:
                pm_join_type = "LEFT JOIN"
                ward_join_type = "LEFT JOIN"
    sql = f"""
            SELECT
                _ben.*,
                _ben.select_primary_member AS name_of_parents,
                _ben.ward AS block_name,
                _ben.name_of_the_settlement AS village_name
            FROM
                (SELECT * FROM `tabBeneficiary Profiling` {condition} {availed_sql} {filter_condition if filter_condition else ''}) AS _ben
            {pm_join_type} `tabPrimary Member` _pm ON _pm.name = _ben.select_primary_member {primary_member_filter}
            {ward_join_type} `tabBlock` _bl ON _bl.name = _ben.ward {ward_filter}
            LEFT JOIN `tabVillage` _vl ON _vl.name = _ben.name_of_the_settlement
            ORDER BY select_primary_member DESC
            LIMIT {page_limit} OFFSET {start}
    """
    return sql
@frappe.whitelist(allow_guest=True)
def execute(name=None):
    return BeneficaryScheme.get_schemes(name)

@frappe.whitelist(allow_guest=True)
def eligible_beneficiaries(scheme=None, columns=[], filters=[], start=0, page_imit=1000):
    # filter value is getting hear
    # print("filter", filters)
    columns = json.loads(columns)
    if scheme is None:
        return frappe.throw('Scheme not found.')
    scheme_doc = frappe.get_doc('Scheme',scheme)
    res = {
        'data':[],
        'count':{
            'total':0,
            'total_family':0,
            'block_count':0,
            'settlement_count':0
        }
    }
    if not scheme_doc:
        return res

    ben_sql = get_beneficiary_scheme_query(scheme_doc,start,page_imit,filters)
    # print(ben_sql)
    total_count_sql = get_total_beneficiary_count_query(scheme_doc , start,page_imit,filters)
    res['data'] = frappe.db.sql(ben_sql, as_dict=True)
    count_sql = f"""
        select
            count(distinct _tbl.name) as total,
            count(distinct _tbl.select_primary_member) as family_count,
            count(distinct _tbl.ward) as block_count,
            count(distinct _tbl.name_of_the_settlement) as settlement_count
        from
            ({total_count_sql}) _tbl
    """
    count_data = frappe.db.sql(count_sql, as_dict=True)
    if len(count_data):
        res['count'].update(count_data[0])
    return res

@frappe.whitelist(allow_guest=True)
def most_eligible_ben():
    scheam_ben_count =[]
    scheame_query = f"""select name  from `tabScheme` """
    get_all_scheame = frappe.db.sql(scheame_query, as_dict=True)
    for scheme in get_all_scheame:
        get_rules = f"""select  rule_field, operator, data from `tabScheme` as _ts JOIN `tabRule Engine Child` as _tsc on _tsc.parent = _ts.name where _ts.name_of_the_scheme ='{scheme.name.replace("'", "''")}';"""

        # get_rules = f"""select  rule_field, operator, data from `tabScheme` as _ts JOIN `tabRule Engine Child` as _tsc on _tsc.parent = _ts.name where _ts.name_of_the_scheme ='{scheme.name}';"""
        rules = frappe.db.sql(get_rules, as_dict=True)
        condition_str =""
        if rules:
            for rule in rules:
                condition_str = f"""{condition_str} {rule.rule_field} {rule.operator} '{rule.data}' AND"""
            # condition_str = f"{condition_str} "
        else:
            condition_str = ""
        get_elegible_ben = f""" SELECT count(name) as abc FROM `tabBeneficiary Profiling` WHERE{condition_str} 1=1 order by abc DESC"""
        all_ben = frappe.db.sql(get_elegible_ben, as_dict=True)
        sch_ben = {"scheam": scheme.name , "bencount": all_ben[0].abc}
        scheam_ben_count.append(sch_ben)
    sorted_schemes = sorted(scheam_ben_count, key=lambda x: x["bencount"], reverse=True)
    # Get the top 5 schemes
    top_5_schemes = sorted_schemes[:5]
    return top_5_schemes

@frappe.whitelist(allow_guest=True)
def top_schemes():
    milestones = frappe.get_list("Milestone category", fields=['name'])
    # user_role_filter = Filter.set_query_filters()
    # user_grole_filter will apply on condtional string
    scheme_with_rule_sql = f"""
        select
            distinct parent
        from
            `tabRule Engine Child`
    """
    scheme_with_rules = frappe.db.sql(scheme_with_rule_sql, as_dict=True)
    scheme_list = [sc.get('parent') for sc in scheme_with_rules]
    for milestone in milestones:
        schemes = frappe.get_list("Scheme", filters={'milestone':milestone.name, 'name':["IN",scheme_list], 'enabled': '1'}, fields=['name'])
        for scheme in schemes:
            scheme['ben_count'] = 0
            scheme_doc = frappe.get_doc('Scheme',scheme.name)
            ben_sql = get_beneficiary_scheme_query(scheme_doc)
            count_sql = f"""
                select
                    count(distinct _tbl.name) as total
                from
                    ({ben_sql}) as _tbl
            """
            # print(count_sql)
            count_data = frappe.db.sql(count_sql, as_dict=True)
            if len(count_data):
                scheme['ben_count'] = count_data[0].total
        sorted_schemes = sorted(schemes, key=lambda x: x.get('ben_count', 0), reverse=True)
        milestone['schemes'] = sorted_schemes[:5]
    return milestones

#Code is not reflecting


@frappe.whitelist()
def get_user_permission(user, join_con=[]):
   sql_query = f"""
        SELECT
            CASE
                WHEN UP.allow = 'State' THEN TS.state_name
                WHEN UP.allow = 'District' THEN TD.district_name
                WHEN UP.allow = 'Block' THEN TB.block_name
                WHEN UP.allow = 'Village' THEN TV.village_name
                WHEN UP.allow = 'Centre' THEN TC.centre_name
                WHEN UP.allow = 'Sub Centre' THEN TCS.sub_centre_name
            END AS name_value,
            UP.for_value,
            UP.name,
            UP.allow,
            UP.user
        FROM `tabUser Permission` AS UP
        LEFT JOIN `tabState` AS TS ON UP.for_value = TS.name AND UP.allow = 'state'
        LEFT JOIN `tabDistrict` AS TD ON UP.for_value = TD.name AND UP.allow = 'district'
        LEFT JOIN `tabBlock` AS TB ON UP.for_value = TB.name AND UP.allow = 'block'
        LEFT JOIN `tabVillage` AS TV ON UP.for_value = TV.name AND UP.allow = 'village'
        LEFT JOIN `tabCentre` AS TC ON UP.for_value = TC.name AND UP.allow = 'centre'
        LEFT JOIN `tabSub Centre` AS TCS ON UP.for_value = TCS.name AND UP.allow = 'Sub Centre'
        WHERE UP.user = '{user}'
    """
   return frappe.db.sql(sql_query, as_dict=True)

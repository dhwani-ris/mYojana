import frappe
from myojana.utils.filter import Filter
from myojana.utils.cache import Cache

class ReportFilter:
    def set_report_filters(filters=None, date_column='creation', str=False, table_name='', csc_filter=True):
        cond_str = Cache.get_user_permission(True)
        new_filters = {}
        str_list = []
        if table_name:
            date_column = f"{table_name}.{date_column}"
        if filters is None:
            return new_filters
        if filters.from_date and filters.to_date:
            if str:
                str_list.append(
                    f"({date_column} between '{filters.from_date}' AND '{filters.to_date}')")
            else:
                new_filters[date_column] = ["between", [
                    filters.from_date, filters.to_date]]
        elif filters.from_date:
            if str:
                str_list.append(f"({date_column} >= '{filters.from_date}')")
            else:
                new_filters[date_column] = [">=", filters.from_date]
        elif filters.to_date:
            if str:
                str_list.append(f"({date_column} <= '{filters.to_date}')")
            else:
                new_filters[date_column] = ["<=", filters.to_date]

        for filter_key in filters:
            if filter_key not in ['from_date', 'to_date']:
                if str:
                    str_list.append(f"({filter_key}='{filters[filter_key]}')")
                else:
                    new_filters[filter_key] = filters[filter_key]

        if csc_filter and ("Administrator" not in frappe.get_roles(frappe.session.user)):
            query_filter = Filter.set_query_filters(True)
            csc_key = f"{table_name}.{query_filter[0]}" if table_name else  f"{query_filter[0]}"
            if str:
                str_list.append(cond_str)
            else:
                new_filters[csc_key] = f"'{query_filter[1]}'"
        if str:
            return ' AND '.join(str_list)
        else:
            return new_filters

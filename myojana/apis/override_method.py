import frappe
import re
import json
import copy
from frappe import _
from frappe.utils import cint, sbool
from frappe.desk.reportview import execute
from frappe.desk.reportview import get_form_params
from frappe.model.utils import is_virtual_doctype
from frappe.model.base_document import get_controller
from frappe.desk.reportview import compress
from collections.abc import Mapping, Sequence
from frappe.types import Filters, FilterSignature
from frappe.database.utils import DefaultOrderBy
from frappe.model.db_query import DatabaseQuery
ORDER_BY_PATTERN = re.compile(r"\ order\ by\ |\ asc|\ ASC|\ desc|\ DESC", flags=re.IGNORECASE)

@frappe.whitelist()
@frappe.read_only()
def get_count() -> int | None:
	args = get_form_params()

	if is_virtual_doctype(args.doctype):
		controller = get_controller(args.doctype)
		return frappe.call(controller.get_count, args=args, **args)

	args.distinct = sbool(args.distinct)
	args.limit = cint(args.limit)
	fieldname = f"`tab{args.doctype}`.name"
	args.order_by = None

	# args.limit is specified to avoid getting accurate count.
	if not args.limit:
		args.fields = [f"count({fieldname}) as total_count"]
		return execute(**args)[0].get("total_count")

	args.fields = [fieldname]
	partial_query = execute(**args, run=0)

	# Count queries are notoriously unpredictable based on the type of filters used.
	# We should not attempt to fetch accurate count for 2 entire minutes! (default timeout)
	# Very short timeout is used to here to set an upper bound on damage a bad request can do.
	# Users can request accurate count by dropping limit from arguments.
	timeout_clause = "SET STATEMENT max_statement_time=1 FOR" if frappe.db.db_type == "mariadb" else ""

	try:
		count = frappe.db.sql(f"{timeout_clause} select count(*) from ( {partial_query} ) p")[0][0]
	except Exception as e:
		if frappe.db.is_statement_timeout(e):  # Skip fetching accurate count
			count = None
		else:
			raise

	if count == args.limit or count is None:
		frappe.local.response_headers.set("Cache-Control", "private,max-age=600,stale-while-revalidate=10800")

	return count


@frappe.whitelist()
@frappe.read_only()
def get():
	args = get_form_params()
	# If virtual doctype, get data from controller get_list method
	if is_virtual_doctype(args.doctype):
		controller = get_controller(args.doctype)
		data = compress(frappe.call(controller.get_list, args=args, **args))
	else:
		data = compress(execute_li(**args), args=args)
	return data

def execute_li(doctype, *args, **kwargs):
	return CustomDatabaseQuery(doctype).execute_li(*args, **kwargs)

class CustomDatabaseQuery(DatabaseQuery):
    def execute_li(
            self,
            fields=None,
            filters: FilterSignature | str | None = None,
            or_filters: FilterSignature | None = None,
            docstatus=None,
            group_by=None,
            order_by=DefaultOrderBy,
            limit_start=False,
            limit_page_length=None,
            as_list=False,
            with_childnames=False,
            debug=False,
            ignore_permissions=False,
            user=None,
            with_comment_count=False,
            join="left join",
            distinct=False,
            start=None,
            page_length=None,
            limit=None,
            ignore_ifnull=False,
            save_user_settings=False,
            save_user_settings_fields=False,
            update=None,
            user_settings=None,
            reference_doctype=None,
            run=True,
            strict=True,
            pluck=None,
            ignore_ddl=False,
            *,
            parent_doctype=None,
        ) -> list:
            if not ignore_permissions:
                self.check_read_permission(self.doctype, parent_doctype=parent_doctype)

            # filters and fields swappable
            # its hard to remember what comes first
            if isinstance(fields, dict) or (fields and isinstance(fields, list) and isinstance(fields[0], list)):
                # if fields is given as dict/list of list, its probably filters
                filters, fields = fields, filters

            elif fields and isinstance(filters, list) and len(filters) > 1 and isinstance(filters[0], str):
                # if `filters` is a list of strings, its probably fields
                filters, fields = fields, filters

            if fields:
                self.fields = fields
            else:
                self.fields = [f"`tab{self.doctype}`.`{pluck or 'name'}`"]

            if start:
                limit_start = start
            if page_length:
                limit_page_length = page_length
            if limit:
                limit_page_length = limit
            if as_list and not isinstance(self.fields, (Sequence | str)) and len(self.fields) > 1:
                frappe.throw(_("Fields must be a list or tuple when as_list is enabled"))

            self.filters: Filters
            self.or_filters: Filters
            for k, _filters in {
                "filters": filters or Filters(),
                "or_filters": or_filters or Filters(),
            }.items():
                if isinstance(_filters, str):
                    _filters = json.loads(_filters)
                if not isinstance(_filters, Filters):
                    _filters = Filters(_filters, doctype=self.doctype)
                setattr(self, k, _filters)

            self.docstatus = docstatus or []
            self.group_by = group_by
            self.order_by = order_by
            self.limit_start = cint(limit_start)
            self.limit_page_length = cint(limit_page_length) if limit_page_length else None
            self.with_childnames = with_childnames
            self.debug = debug
            self.join = join
            self.distinct = distinct
            self.as_list = as_list
            self.ignore_ifnull = ignore_ifnull
            self.flags.ignore_permissions = ignore_permissions
            self.user = user or frappe.session.user
            self.update = update
            self.user_settings_fields = copy.deepcopy(self.fields)
            self.run = run
            self.strict = strict
            self.ignore_ddl = ignore_ddl
            self.parent_doctype = parent_doctype

            # for contextual user permission check
            # to determine which user permission is applicable on link field of specific doctype
            self.reference_doctype = reference_doctype or self.doctype

            if user_settings:
                self.user_settings = json.loads(user_settings)

            if is_virtual_doctype(self.doctype):
                from frappe.model.base_document import get_controller

                controller = get_controller(self.doctype)
                if not hasattr(controller, "get_list"):
                    return []

                self.parse_args()
                kwargs = {
                    "as_list": as_list,
                    "with_comment_count": with_comment_count,
                    "save_user_settings": save_user_settings,
                    "save_user_settings_fields": save_user_settings_fields,
                    "pluck": pluck,
                    "parent_doctype": parent_doctype,
                } | self.__dict__
                return frappe.call(controller.get_list, args=kwargs, **kwargs)

            self.columns = self.get_table_columns()

            # no table & ignore_ddl, return
            if not self.columns:
                return []

            result = self.build_and_run()

            if sbool(with_comment_count) and not as_list and self.doctype:
                self.add_comment_count(result)

            if save_user_settings:
                self.save_user_settings_fields = save_user_settings_fields
                self.update_user_settings()

            if pluck:
                return [d[pluck] for d in result]

            return result

    def build_and_run(self):
            args = self.prepare_args()
            args.limit = self.add_limit()

            if not args.fields:
                # apply_fieldlevel_read_permissions has likely removed ALL the fields that user asked for
                return []

            if args.conditions:
                args.conditions = "where " + args.conditions

            if self.distinct:
                args.fields = "distinct " + args.fields
                args.order_by = ""  # TODO: recheck for alternative

            # Postgres requires any field that appears in the select clause to also
            # appear in the order by and group by clause
            if frappe.db.db_type == "postgres" and args.order_by and args.group_by:
                args = self.prepare_select_args(args)

            query = """select {fields}
                from {tables}
                {conditions}
                {group_by}
                {order_by}
                {limit}""".format(**args)

            return frappe.db.sql(
                query,
                as_dict=not self.as_list,
                debug=self.debug,
                update=self.update,
                ignore_ddl=self.ignore_ddl,
                run=self.run,
            )

    def prepare_select_args(self, args):
        order_field = ORDER_BY_PATTERN.sub("", args.order_by)

        if order_field not in args.fields:
            extracted_column = order_column = order_field.replace("`", "")
            if "." in extracted_column:
                extracted_column = extracted_column.split(".")[1]

            args.fields += f", MAX(`tab{self.doctype}`.`{extracted_column}`) as `{order_column}`"
            args.order_by = args.order_by.replace(order_field, f"`{order_column}`")

        return args
    
    



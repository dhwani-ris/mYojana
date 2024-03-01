# Copyright (c) 2023, suvaidyam and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document
import re
from frappe import _
import frappe
class Scheme(Document):
	def validate(self):
		pass

	def evaluate_expression(input_dict, expression):
		if not re.match(r"^[a-zA-Z0-9\s()+\-/*%&|=!<>]*$", expression):
			return 'Invalid expression'

		# expression = expression.lower()
		expression = expression.replace('and', 'and').replace('or', 'or')
		expression = expression.replace('AND', 'and').replace('OR', 'or')

		for key, value in input_dict.items():
			expression = expression.replace(key, str(value))

		try:
			return eval(expression)
		except Exception as err:
			return str(err)

	def generate_query_string(rows, __expression):
		expression = __expression.replace('and', '#').replace('or', '%')
		expression = expression.replace('AND', '#').replace('OR', '%')

		for row in rows:
			if row['operator'] in ['IN', 'NOT IN']:
				val = ','.join([f"'{e.strip()}'" for e in row['data'].split(',')]) if row['data'] else ''
				expression = expression.replace(row['code'], f"{row['rule_field']} {row['operator']} ({val})")
			else:
				expression = expression.replace(row['code'], f"{row['rule_field']} {row['operator']} '{row['data']}'")

		expression = expression.replace('#', 'and').replace('%', 'or')
		return f"select * from `tabBeneficiary Profiling` where {expression}"



# Copyright (c) 2023, suvaidyam and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from myojana.services.family import family
from datetime import datetime, timedelta

class BeneficiaryProfiling(Document):
	# def printKeys(obj, f=False):
	# 	if f and obj.get('_doc_before_save', None):
	# 		for key in obj.get('_doc_before_save').__dict__.keys():
	# 			print(key,obj.get(key, None))
	# 	else:
	# 		for key in obj.__dict__.keys():
	# 			print(key,obj.get(key, None))
# find family and get family function
	def get_family(contact_number):
		docs = frappe.db.get_list(doctype='Primary Member', filters={'name':contact_number}, fields=["name", "name_of_head_of_family",'name_of_head_of_family.name_of_the_beneficiary as name_of_the_beneficiary'])
		if len(docs):
			return docs[0]
		return None
		
# create new souource of information
	def create_source_of_information(new_source_of_information):
		data_exist = frappe.db.exists("Source Of Information", new_source_of_information)
		if not data_exist:
			new_source_of_information_doc = frappe.new_doc("Source Of Information")
			new_source_of_information_doc.source_name = new_source_of_information
			new_source_of_information_doc.save()
# create new house_type
	def create_house_type(add_house_type):
		data_exist = frappe.db.exists("House Types", add_house_type)
		if not data_exist:
			current_house_type_doc = frappe.new_doc("House Types")
			current_house_type_doc.house_type_name = add_house_type
			current_house_type_doc.save()
# create new_camp
	def create_new_camp(new_camp):
		data_exist = frappe.db.exists("Camp", new_camp)
		if not data_exist:
			camp_doc = frappe.new_doc("Camp")
			camp_doc.name_of_the_camp = new_camp
			camp_doc.save()
# create social_vulnerable_category
	def new_social_vulnerable_category(other_social_vulnerable_category):
		data_exist = frappe.db.exists("Social vulnerable category", other_social_vulnerable_category)
		if not data_exist:
			scc_doc = frappe.new_doc("Social vulnerable category")
			scc_doc.social_vulnerable_category = other_social_vulnerable_category
			scc_doc.save()
# create social_vulnerable_category
	def other_new_occupation(new_occupation , occupational_category , new_occupation_category):
		data_exist = frappe.db.exists("Occupation", new_occupation)
		if not data_exist:
			occupation = frappe.new_doc("Occupation")
			occupation.occupation = new_occupation
			if new_occupation_category:
				data_exist = frappe.db.exists("Occupational Category", new_occupation_category)
				if not data_exist:
					new_occ_category = frappe.new_doc("Occupational Category")
					new_occ_category.occupational_category = new_occupation_category
					data = new_occ_category.save()
					occupation.occupational_category = data
					# occupation.save()
			else:
				occupation.occupational_category = occupational_category
			occupation.save()

	def validate(self):
		if(self.contact_number == self.alternate_contact_number and self.contact_number is not None):
			return frappe.throw("Alternate contact number cannot be the same as mobile number")
		if(self.do_you_have_any_id_documents != "Yes"):
			self.id_table_list = []
		if(self.date_of_birth and self.date_of_visit):
			date_of_visit = datetime.strptime(self.date_of_visit, "%Y-%m-%d").date() if isinstance(self.date_of_visit, str) else self.date_of_visit
			date_of_birth = datetime.strptime(self.date_of_birth, "%Y-%m-%d").date() if isinstance(self.date_of_birth, str) else self.date_of_birth
			if date_of_visit < date_of_birth:
				return frappe.throw("Date of Visit shall not be before the <strong>Date of Birth</strong>")
		if(self.what_is_the_extent_of_your_disability == "Above 40%"):
			if(self.proof_of_disability == []):
				return frappe.throw("""Mandatory fields required in Beneficiary <br/> <br/>  &#x2022; Profiling Proof of disability""")
		# BeneficiaryProfiling.printKeys(self)
		if(self.has_anyone_from_your_family_visisted_before == "No"):
			if self.get('_doc_before_save', None): # Update
				family_doc = BeneficiaryProfiling.get_family(self.contact_number)
				# akndcjkdxckjvbxjbvkjcxbvkjcxbkjvbckj
				if family_doc and not (family_doc.name_of_head_of_family == self.name):
					frappe.throw(f"Primary member exist with name <a target='_blank' href='/app/primary-member/{family_doc.name}'><b>{family_doc.name_of_the_beneficiary}</b> [{self.contact_number}]</a>, Please Select Primary Member")
					return
				if self.get('_doc_before_save').get('has_anyone_from_your_family_visisted_before') == 'Yes':
					self.select_primary_member = None # set family to None
			else: # Create
				family_doc = BeneficiaryProfiling.get_family(self.contact_number)
				if family_doc:
					frappe.throw(f"Primary member exist with name <a target='_blank' href='/app/primary-member/{family_doc.name}'><b>{family_doc.name_of_the_beneficiary}</b> [{self.contact_number}]</a>, Please Select Primary Member")
					return
		else:
			_doc_before_save = self.get('_doc_before_save', None)
			# if _doc_before_save is not None:
			# 	if self.select_primary_member == _doc_before_save.get('select_primary_member'):
			# 		frappe.throw(f"Please select other primary member")
			# 		return
	def after_insert(self):
		print("Ben[after_insert]")
		# if not self.centre and "Administrator" not in frappe.get_roles(frappe.session.user):
			# frappe.db.set_value('Beneficiary Profiling', self.name, update_modified=False)
		# if not self.sub_centre:
		# 	self.sub_centre = sub_centre
		# 	frappe.db.set_value('Beneficiary Profiling', self.name, 'sub_centre', sub_centre, update_modified=False)
		if(self.new_source_of_information):
			BeneficiaryProfiling.create_source_of_information(self.new_source_of_information)
		if(self.add_house_type):
			BeneficiaryProfiling.create_house_type(self.add_house_type)
		if(self.new_camp):
			BeneficiaryProfiling.create_new_camp(self.new_camp)
		if(self.other_social_vulnerable_category):
			BeneficiaryProfiling.new_social_vulnerable_category(self.other_social_vulnerable_category)
		if(self.has_anyone_from_your_family_visisted_before == "No"):
			family_doc = family.create(self)
			frappe.db.set_value('Beneficiary Profiling', self.name, 'select_primary_member', family_doc.name, update_modified=False)

	def on_update(self):
		if(self.new_source_of_information):
			BeneficiaryProfiling.create_source_of_information(self.new_source_of_information)
		if(self.add_house_type):
			BeneficiaryProfiling.create_house_type(self.add_house_type)
		if(self.new_camp):
			BeneficiaryProfiling.create_new_camp(self.new_camp)
		if(self.other_social_vulnerable_category):
			BeneficiaryProfiling.new_social_vulnerable_category(self.other_social_vulnerable_category)
		if(self.new_occupation and self.occupational_category or self.new_occupation_category):
			BeneficiaryProfiling.other_new_occupation(self.new_occupation , self.occupational_category , self.new_occupation_category)
		if self.get('localname'):
			return
		else:
			if(self.has_anyone_from_your_family_visisted_before == "No"):
				if self.get('_doc_before_save', None):
					_doc_before_save = self.get('_doc_before_save')
					if _doc_before_save.get('has_anyone_from_your_family_visisted_before') == 'Yes':
						family_doc = family.update(self)
						frappe.db.set_value('Beneficiary Profiling', self.name, 'select_primary_member', family_doc.name, update_modified=False)
					else:
						family_doc = family.update(self)
						frappe.db.set_value('Beneficiary Profiling', self.name, 'select_primary_member', family_doc.name, update_modified=False)
			else: # handle if No -> Yes
				if self.get('_doc_before_save', None):
					_doc_before_save = self.get('_doc_before_save')
					if _doc_before_save.get('has_anyone_from_your_family_visisted_before') == 'No':
						family_doc = BeneficiaryProfiling.get_family(_doc_before_save.contact_number)
						if family_doc:
							query = f"UPDATE `tabBeneficiary Profiling` SET select_primary_member = '{self.select_primary_member}' WHERE select_primary_member = '{_doc_before_save.select_primary_member}'"
							frappe.db.sql(query)
							frappe.db.delete("Primary Member", {"name": family_doc.name})


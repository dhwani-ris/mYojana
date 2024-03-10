import frappe
class Gen_Master_Data:
    def create_data(doctype , json_data=[]):
        if not doctype:
            return
        for item in json_data:    
            doc = frappe.new_doc(doctype)
            for key, value in item.items():
                doc[key] = value
                # print(f"{key}: {value}")
            doc.save()
            print("doc_insert", doc)

    def insert_data(json):
        pass
        # Gen_Master_Data.create_data("State",json)
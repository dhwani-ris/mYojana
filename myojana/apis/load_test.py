import frappe
import datetime
import random
import string
import uuid

def generate_random_indian_phone_number():
    first_digit = random.choice([6,7, 8, 9])
    rest_digits = ''.join(random.choices('0123456789', k=9))
    phone_number = str(first_digit) + rest_digits
    return phone_number

def generate_indian_name(gender):
    male_names = ["Aarav", "Vikram", "Arjun", "Rahul", "Aryan", "Rohan", "Kabir", "Aditya", "Shivam", "Krishna",
                  "Amit", "Ankit", "Ashish", "Alok", "Avinash", "Akshay", "Ayush", "Bhaskar", "Chandan", "Dheeraj",
                  "Deepak", "Gaurav", "Ganesh", "Hitesh", "Harsh", "Himanshu", "Jatin", "Jagdish", "Karan", "Kunal",
                  "Lalit", "Manish", "Mukesh", "Nitin", "Nikhil", "Pawan", "Prateek", "Rajesh", "Ravi", "Sachin",
                  "Sanjay", "Saurabh", "Sumit", "Tarun", "Utkarsh", "Vivek", "Yogesh", "Abhinav", "Arun", "Avinash",
                  "Alok", "Bhuvan", "Chirag", "Devendra", "Dinesh", "Dilip", "Girish", "Govind", "Hari", "Jagat",
                  "Jitendra", "Kamal", "Kishan", "Laxman", "Mahesh", "Mohan", "Naveen", "Pankaj", "Pradeep", "Rajiv",
                  "Rakesh", "Ramesh", "Sandeep", "Satish", "Shyam", "Sunil", "Surendra", "Vikas", "Vinod", "Yash"]
    female_names = ["Aaradhya", "Isha", "Sakshi", "Priya", "Ananya", "Diya", "Kavya", "Trisha", "Mira", "Neha",
                    "Anjali", "Bhavna", "Chitra", "Deepika", "Divya", "Ekta", "Jyoti", "Komal", "Pooja", "Rashmi",
                    "Sunita", "Vandana", "Varsha", "Vidya", "Ambika", "Asha", "Aarti", "Anuradha", "Geeta", "Ganga",
                    "Hema", "Indira", "Kiran", "Lakshmi", "Mamta", "Meena", "Neeta", "Poonam", "Radha", "Rani",
                    "Renuka", "Rekha", "Seema", "Sharda", "Shanti", "Sita", "Sarita", "Sarla", "Savita", "Tanuja",
                    "Uma", "Vijaya", "Veena", "Yamini", "Zara", "Aradhana", "Aparna", "Bhavani", "Chanchal", "Darshana",
                    "Deepti", "Gauri", "Harsha", "Ila", "Jayanti", "Kamala", "Leela", "Madhuri", "Malini", "Nalini",
                    "Padmini", "Rajani", "Shashi", "Sonal", "Suchitra", "Vidhi", "Yogita", "Jaya", "Meera", "Nisha"]
    surnames = ["Patel", "Shah", "Desai", "Mehta", "Joshi", "Sharma", "Gupta", "Shah", "Singh", "Verma",
                "Trivedi", "Pandey", "Yadav", "Patil", "Soni", "Mishra", "Das", "Kumar", "Chauhan", "Gandhi",
                "Saxena", "Agarwal", "Choudhury", "Bose", "Banerjee", "Dutta", "Chatterjee", "Mukherjee", "Sen",
                "Nair", "Menon", "Iyer", "Reddy", "Rao", "Rajan", "Naidu", "Kulkarni", "Gowda", "Shetty",
                "Rajput", "Rawat", "Singh", "Chauhan", "Thakur", "Sinha", "Pathak", "Goswami", "Jha",
                "Bhattacharya", "Dutta", "Mitra", "Ghosh", "Ray", "Roy", "Malhotra", "Acharya", "Shrestha",
                "Rana", "Subedi", "Bhandari", "Shakya", "Gurung", "Tamang", "Thapa", "Bhattarai", "Lama",
                "Dhakal", "Rai", "Adhikari", "Maharjan", "Koirala", "Poudel", "Basnet", "Pandit", "Sharma",
                "Pokharel", "Magar", "Khanal", "Shahi", "Giri", "Dahal", "Khatri", "Panta", "Joshi",
                "Shrestha", "Bista", "Pariyar", "Sherpa", "Neupane", "Bhatta", "Shah", "Thakali", "Panta"]

    if gender == "Male":
        return f"{random.choice(male_names)} {random.choice(surnames)}"
    elif gender == "Female":
        return f"{random.choice(female_names)} {random.choice(surnames)}"
    elif gender == "Transgender":
        return f"{random.choice(male_names)} {random.choice(surnames)}"
    elif gender == "Others":
        return f"{random.choice(male_names)} {random.choice(surnames)}"
    else:
        return "Invalid gender specified. Please choose from 'male', 'female', or 'others'."
    
def random_string(length):
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))


def random_date(start, end):
    return start + datetime.timedelta(
        seconds=random.randint(0, int((end - start).total_seconds()))
    )

def calculate_age(date_of_birth):
    dob = datetime.datetime.strptime(date_of_birth, "%Y-%m-%d")
    current_date = datetime.datetime.now()
    age = current_date.year - dob.year
    month_diff = current_date.month - dob.month
    if month_diff < 0 or (month_diff == 0 and current_date.day < dob.day):
        age -= 1
        month_diff += 12
    return age, month_diff

disabilities = [
    "Blindness",
    "Low vision",
    "Leprosy cured persons",
    "Locomotor disability",
    "Dwarfism",
    "Intellectual disability",
    "Mental illness",
    "Cerebral Palsy",
    "Specific learning disability",
    "Speech and Language disability",
    "Hearing impairment",
    "Muscular dystrophy",
    "Acid attack victim",
    "Parkinson's disease",
    "Multiple Sclerosis",
    "Thalassemia",
    "Hemophilia",
    "Sickle cell disease",
    "Autism spectrum disorder",
    "Chronic neurological conditions",
    "Multiple disabilities including deaf and blindness."
]

def generate_random_bulk_data():
    Caste_category = frappe.get_list('Caste category',filters={'name': ['!=', 'Others']}, pluck='name')
    Schemes = frappe.get_list('Scheme', pluck='name')
    Religion = frappe.get_list('Religion',filters={'name': ['!=', 'Others']}, pluck='name')
    Education = frappe.get_list('Education',filters={'name': ['!=', 'Others']}, pluck='name')
    Occupation = frappe.get_list('Occupation',filters={'name': ['!=', 'Others']}, pluck='name')
    Marital_status = frappe.get_list('Marital status',filters={'name': ['!=', 'Others']}, pluck='name')
    Sub_Centre = frappe.get_list('Sub Centre', pluck='name')
    Source_Of_Information = frappe.get_list(
        'Source Of Information',filters={'name': ['!=', 'Others']}, pluck='name')
    Social_vulnerable_category = frappe.get_list(
        'Social vulnerable category',filters={'name': ['!=', 'Others']}, pluck='name')
    House_Types = frappe.get_list('House Types',filters={'name': ['!=', 'Others']} ,pluck='name')
    ID_Document = frappe.get_list('ID Document', pluck='name')
    Village = frappe.get_list(
        'Village', filters={'state': 'S07'}, pluck='name')
    date_of_birth = random_date(datetime.datetime(
        1950, 1, 1), datetime.datetime(2010, 1, 1)).strftime("%Y-%m-%d")
    completed_age, completed_age_month = calculate_age(date_of_birth)
    random_oc = random.choice(Occupation)
    random_occ = frappe.get_value(
        'Occupation', random_oc, 'occupational_category')
    random_sub_center = random.choice(Sub_Centre)
    random_center = frappe.get_value(
        'Sub Centre', random_sub_center, 'centre')
    soi = random.choice(Source_Of_Information)
    ms = random.choice(Marital_status)
    sv = random.choice(["Yes", "No"])
    pwd = random.choice(["Yes", "No"])
    vil = random.choice(Village)
    wards = frappe.get_value('Village', vil, 'block')
    dis = frappe.get_value('Village', vil, 'district')
    any_doc = random.choice(["Yes", "No"])
    weyd = random.choice(["Below 40%","Do not know"])
    scheme = random.choice(Schemes)
    Milestone_category = frappe.get_value('Scheme', scheme, 'milestone')
    name_of_department = frappe.get_value(
        'Scheme', scheme, 'name_of_department')
    random_gender = random.choice(["Male", "Female", "Transgender", "Others"])
    data = {
        "date_of_visit": random_date(datetime.datetime(2020, 1, 1), datetime.datetime(2024, 1, 1)).strftime("%Y-%m-%d"),
        "name_of_the_beneficiary": generate_indian_name(random_gender),
        "gender": random_gender,
        "date_of_birth": date_of_birth,
        "completed_age": completed_age,
        "completed_age_month": completed_age_month,
        "contact_number": generate_random_indian_phone_number(),
        "centre": random_center,
        "sub_centre": random_sub_center,
        "source_of_information": soi,
        **({"name_of_the_camp": random.choice(frappe.get_list('Camp', pluck='name'))} if soi == 'Camp' else {}),
        "has_anyone_from_your_family_visisted_before": 'No',
        "caste_category": random.choice(Caste_category),
        "religion": random.choice(Religion),
        "education": random.choice(Education),
        "current_occupation": random_oc,
        "occupational_category": random_occ,
        "marital_status": ms,
        **({"spouses_name": random_string(10)} if ms == 'Married' else {}),
        "social_vulnerable": sv,
        **({"social_vulnerable_category": random.choice(Social_vulnerable_category)} if sv == 'Yes' else {}),
        "are_you_a_person_with_disability_pwd": pwd,
        **({"type_of_disability": random.choice(disabilities)} if pwd == 'Yes' else {}),
        **({"what_is_the_extent_of_your_disability": weyd} if pwd == 'Yes' else {}),
        "annual_income": random.randint(10000, 1000000),
        "do_you_have_any_bank_account": random.choice(["Yes", "No"]),
        "fathers_name": generate_indian_name("Male"),
        "mothers_name": generate_indian_name("Female"),
        "added_by": 'Administrator',
        "current_house_type": random.choice(House_Types),
        "state": 'S07',
        "state_of_origin": 'S07',
        "district": dis,
        "ward": wards,
        "name_of_the_settlement": vil,
        "do_you_have_any_id_documents": any_doc,
        "overall_status":"Partially completed"
    }
    if any_doc == 'Yes':
        for i in range(3):
            data.setdefault("id_table_list", []).append({
                "doctype": "ID Document Child",
                "enter_id_number": ''.join(random.choice(string.digits) for _ in range(12)),
                "which_of_the_following_id_documents_do_you_have": random.choice(ID_Document)
            })
    for i in range(5):
        application_submitted = random.choice(["Yes", "Completed"])
        data.setdefault("scheme_table", []).append({
            "amount_paid": random.randint(500, 1000),
            "application_number": f"APP-{uuid.uuid4().hex[:6]}",
            "application_submitted": application_submitted,
            "date_of_application": datetime.datetime.now().strftime("%Y-%m-%d"),
            "milestone_category": Milestone_category,
            "mode_of_application": random.choice(["Online", "Offline"]),
            "name_of_the_department": name_of_department,
            **({"date_of_completion": datetime.datetime.now().strftime("%Y-%m-%d") if application_submitted == "Completed" else ""}),
            "name_of_the_scheme":  scheme,
            "paid_by": random.choice(["Self", "CSC"]),
            "reason_of_application": "any",
            "remarks": "any",
            "status":"Under process" if application_submitted == "Yes" else "Completed"
        })
        data.setdefault("follow_up_table", []).append({
            "follow": random_sub_center,
            "follow_up_date": datetime.datetime.now().strftime("%Y-%m-%d"),
            "follow_up_mode": random.choice(["Home visit", "Phone call", "Centre visit", "In-person visit"]),
            "follow_up_status": "Completed" if application_submitted == "Completed" else "Document submitted",
            "follow_up_with": random.choice(["Beneficiary", "Government department", "Government website", "Others"]),
            "name_of_the_scheme": scheme,
            "remarks": "any"
        })
    return data
@frappe.whitelist()
def create_beneficiary_profiling(count=10):
    if frappe.session.user == "Administrator":
        for _ in range(count):
            beneficiary = frappe.new_doc("Beneficiary Profiling")
            beneficiary.update(generate_random_bulk_data())
            beneficiary.insert()
        return count
    else:
        return "Invalid Access!"
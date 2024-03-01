import frappe

def update_age():
    query = """
        UPDATE
            `tabBeneficiary Profiling`
        SET
            completed_age = (
                CASE
                    WHEN MONTH(CURDATE()) < MONTH(date_of_birth) OR (MONTH(CURDATE()) = MONTH(date_of_birth) AND DAY(CURDATE()) < DAY(date_of_birth)) THEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE())
                    ELSE TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE())
            END
            ),
            completed_age_month = (TIMESTAMPDIFF(MONTH, date_of_birth, CURDATE()) % 12)
        WHERE
            completed_age != (
                CASE
                    WHEN MONTH(CURDATE()) < MONTH(date_of_birth) OR (MONTH(CURDATE()) = MONTH(date_of_birth) AND DAY(CURDATE()) < DAY(date_of_birth)) THEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE())
                    ELSE TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE())
                END
            )
            OR
            completed_age_month != (TIMESTAMPDIFF(MONTH, date_of_birth, CURDATE()) % 12);
    """
    try:
        data = frappe.db.sql(query, as_dict=True)
    except Exception as e:
        frappe.throw(str(e))

def update_dob_of_ben():
    query = """UPDATE `tabBeneficiary Profiling`
    SET completed_age = completed_age + 1
    WHERE DATE_FORMAT(date_of_birth, '%m-%d') = DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '%m-%d');
    """
    data = frappe.db.sql(query, as_dict=True)

    return data

def update_dob_months():
    query = """UPDATE `tabBeneficiary Profiling`
        SET completed_age_month =
            CASE
                WHEN completed_age_month < 11 THEN completed_age_month + 1
                ELSE 0
            END
        WHERE DATE_FORMAT(date_of_birth, '%d') = DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '%d');
    """
    data = frappe.db.sql(query, as_dict=True)
    return data


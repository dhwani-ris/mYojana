
let _frm;
let global_frm;
// global variable
const dialogsConfig = {
  document_submitted: {
    title: __('Enter details for Support'),
    fields: [
      {
        label: __('Date of application'),
        fieldname: 'date_of_application',
        fieldtype: 'Date',
        reqd: 1,
        _doc: true
      },
      {
        label: __('Mode of application'),
        fieldname: 'mode_of_application',
        fieldtype: 'Select',
        reqd: 1,
        options: [__("Online"), __("Offline")],
        _doc: true
      },
      {
        label: __('Reason of application'),
        fieldname: 'reason_of_application',
        fieldtype: 'Data',
        _doc: true
      },
      {
        label: __('Application number'),
        fieldname: 'application_number',
        fieldtype: 'Data',
        _doc: true
      },
      {
        label: __('Amount paid'),
        fieldname: 'amount_paid',
        fieldtype: 'Int',
        _doc: true
      },
      {
        label: __('Paid by'),
        fieldname: 'paid_by',
        fieldtype: 'Select',
        options: [__("Self"), __("CSC")],
        _doc: true
      },
      {
        label: __('Remarks'),
        fieldname: 'remarks',
        fieldtype: 'Data',
        _doc: true
      }
    ]
  },

  document_completed_frm_support: {
    title: __('Enter details for Support'),
    fields: [
      {
        label: __('Date of application'),
        fieldname: 'date_of_application',
        fieldtype: 'Date',
        reqd: 1,
        _doc: true
      },
      {
        label: __('Date of completion'),
        fieldname: 'date_of_completion',
        fieldtype: 'Date',
        reqd: 1,
        _doc: true
      },
      {
        label: __('Mode of application'),
        fieldname: 'mode_of_application',
        fieldtype: 'Select',
        reqd: 1,
        options: [__("Online"), __("Offline")],
        _doc: true
      },
      {
        label: __('Reason of application'),
        fieldname: 'reason_of_application',
        fieldtype: 'Data',
        _doc: true
      },
      {
        label: __('Application number'),
        fieldname: 'application_number',
        fieldtype: 'Data',
        _doc: true
      },
      {
        label: __('Amount paid'),
        fieldname: 'amount_paid',
        fieldtype: 'Int',
        _doc: true
      },
      {
        label: __('Paid by'),
        fieldname: 'paid_by',
        fieldtype: 'Select',
        options: [__("Self"), __("CSC")],
        _doc: true
      },
      {
        label: __('Completion certificate'),
        fieldname: 'completion_certificate',
        fieldtype: 'Attach',
        _doc: true
      },
      {
        label: __('Remarks'),
        fieldname: 'remarks',
        fieldtype: 'Data',
        _doc: true
      }
    ]
  },
  document_completed: {
    title: __('Enter details for Support'),
    fields: [
      {
        label: __('Date of completion'),
        fieldname: 'date_of_completion',
        fieldtype: 'Date',
        reqd: 1,
        _doc: true
      },
      {
        label: __('Completion certificate'),
        fieldname: 'completion_certificate',
        fieldtype: 'Attach',
        _doc: true
      },
      {
        label: __('Remarks'),
        fieldname: 'remarks',
        fieldtype: 'Data',
        _doc: true
      }
    ]
  },
  document_rejected: {
    title: __('Enter details for Support'),
    fields: [
      {
        label: __('Date of rejection'),
        fieldname: 'date_of_rejection',
        fieldtype: 'Date',
        reqd: 1,
        _doc: true
      },
      {
        label: __('Reason of rejection'),
        fieldname: 'reason_of_rejection',
        fieldtype: 'Data',
        reqd: 1,
        _doc: true
      },
      {
        label: __('Remarks'),
        fieldname: 'remarks',
        fieldtype: 'Data',
        _doc: true
      }
    ]
  }
}
const doc_submitted_validate = (_doc, _scheme) => {
  if (_doc.date_of_application < _frm.doc.date_of_visit) {
    return {
      status: false,
      message: __("Date of application should not be less than date of visit"),
    }
  } else if (_doc.date_of_application > frappe.datetime.get_today()) {
    return {
      status: false,
      message: __("Date of application should not be greater than today's date")
    }
  } else {
    return {
      status: true,
      // message:"Invalid "
    }
  }
}
const doc_rejected_validate = (_doc, _scheme) => {
  if (_doc.date_of_rejection < _frm.doc.date_of_visit) {
    return {
      status: false,
      message: __("Date of visit should not be less than date of visit")
    }
  } else if (_doc.date_of_rejection < _scheme.date_of_application) {
    return {
      status: false,
      message: __("Date of rejection should not be less than date of application")
    }
  } else if (_doc.date_of_rejection > frappe.datetime.get_today()) {
    return {
      status: false,
      message: __("Date of rejection should not be greater than today's date")
    }
  } else {
    return {
      status: true,
      // message:"Invalid "
    }
  }
}
const date_of_complete_validate = (_doc, _scheme) => {
  console.log(_doc, _scheme)
  if (_doc.date_of_application < _frm.doc.date_of_visit) {
    return {
      status: false,
      message: __("Date of application should not be less than date of visit")

    }
  } else if (_doc.date_of_completion < _frm.doc.date_of_visit) {
    return {
      status: false,
      message: __("Date of completion should not be less than date of visit")
    }
  } else if (_doc.date_of_completion > frappe.datetime.get_today()) {
    return {
      status: false,
      message: __("Date of completion should not be greater than today's date")
    }
  } else if ((_doc.date_of_completion < _doc.date_of_application) || (_doc.date_of_completion < _scheme?.date_of_application)) {
    return {
      status: false,
      message: __("Date of completion should not be less than Date of Application")
    }
  } else {
    return {
      status: true,
      // message:"Invalid "
    }
  }
}
const createDialog = (_doc, config, validator = null) => {
  return new frappe.ui.Dialog({
    title: config.title,
    fields: config.fields,
    size: 'small', // small, large, extra-large
    primary_action_label: 'Save',
    primary_action(obj) {
      if (validator) {
        let valid = validator(obj, _doc)
        if (!valid.status) {
          return frappe.throw(valid.message);
        }
      }
      let fields = config.fields.filter(f => f._doc).map(e => e.fieldname)
      for (let field of fields) {
        if (obj[field])
          _doc[field] = obj[field]
      }
      this.hide()
    }
  });
}

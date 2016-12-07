PBissuesEnum = {

}

PBTaskTypesEnum = {
    phone: "phone"
}

export function Task(tiny_description, brief_description, start_date, end_date,
              task_type, issues, priority) {
    this.tiny_description = tiny_description;
    this.brief_description = brief_description;
    this.start_date = start_date;
    this.end_date = end_date;
    this.task_type = task_type;
    // TODO:  Implement some sort of issues hashtag?
    this.priority = priority;
}

export function PhoneTask(general_script, supporter_script, opposition_script, notes,
                   call_my_national_senators, call_my_national_representatives,
                   call_custom_senators, call_custom_representatives, call_custom) {
    this.general_script = general_script;
    this.supporter_script = supporter_script;
    this.opposition_script = opposition_script;
    this.notes = notes;
    this.call_my_national_senators = call_my_national_senators;
    this.call_my_national_representatives = call_my_national_representatives;
    this.call_custom_senators = call_custom_senators;
    this.call_custom_representatives = call_custom_representatives;
    this.call_custom = call_custom;
}

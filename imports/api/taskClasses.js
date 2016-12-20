PBissuesEnum = {

}

export var PBTaskTypesEnum = {
    phone: "phone",
    freeform: "freeform"
}

export function Task(tiny_description, brief_description, start_date, end_date,
              task_type, issues, priority, xp_value, group) {
    this.tiny_description = tiny_description || "";
    this.brief_description = brief_description || "";
    this.start_date = start_date || new Date();
    this.end_date = end_date || new Date();
    this.task_type = task_type;
    if (!task_type) {
        throw "Bad task type passed to Task Constructor"
    }
    // TODO:  Implement some sort of issues hashtag?
    this.issues = issues || [];
    this.priority = priority || 3;
    this.xp_value = xp_value || 1;
    this.group = group || 0;
}

export function PhoneTask(general_script, supporter_script, opposition_script, notes,
                   call_my_national_senators, call_my_national_representatives,
                   call_custom_senators, call_custom_representatives, call_custom) {
    this.general_script = general_script || "";
    this.supporter_script = supporter_script || "";
    this.opposition_script = opposition_script || "";
    this.notes = notes || "";
    this.call_my_national_senators = call_my_national_senators || true;
    this.call_my_national_representatives = call_my_national_representatives || true;
    this.call_custom_senators = call_custom_senators || [];
    this.call_custom_representatives = call_custom_representatives || [];
    this.call_custom = call_custom || [];
}

export function FreeformTask(instructions, notes) {
    this.instructions = instructions;
    this.notes = notes;
}
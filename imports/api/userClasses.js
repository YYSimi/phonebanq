export function ContactPreferences(
    fRecurringNotify, notifyPeriod, notifyPeriodType,
    fUseFacebookForRecurring, fUseEmailForRecurring,
    fMajorEventNotify, fUseFacebookForMajor, fUseEmailForMajor){
        this.fRecurringNotify = fRecurringNotify;
        this.notifyPeriod = notifyPeriod || 1;
        this.notifyPeriodType = notifyPeriodType || "daily";
        this.fUseFacebookForRecurring = fUseFacebookForRecurring;
        this.fUseEmailForRecurring = fUseEmailForRecurring;
        this.fMajorEventNotify = fMajorEventNotify;
        this.fUseFacebookForMajor = fUseFacebookForMajor;
        this.fUseEmailForMajor = fUseEmailForMajor;
}

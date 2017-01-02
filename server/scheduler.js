
// TODO:  Figure out how to instantiate these.  Having a single, monolithic scheduler will
//        cause problems, and is already troublesome for testing purposes.
export var Scheduler = function() {
    var dailyActions = {};
    var weeklyActions = {};
    var monthlyActions = {};

    var schedulerState = "running";

    var weeklyActionDay = 4 //Thursday;

    function SchedulerEntry(callback, frequency, ticsRemaining) {
        this.callback = callback;
        this.frequency = frequency;
        this.ticsRemaining = ticsRemaining;
    }

    function registerAction(callback, frequency, frequencyType) {
        var token = generateUUID();
        var entry = new SchedulerEntry(callback, frequency, frequency);
        switch(frequencyType) {
            case "daily":
                dailyActions[token] = entry;
                break;
            case "weekly":
                weeklyActions[token] = entry;
                break;
            case "monthly":
                monthlyActions[token] = entry;
                break;
            default:
            throw "Specified unknown freqencyType: " + frequencyType;
        }
        return token;
    };

    function unregisterAction(token) {
        delete dailyActions[token];
        delete weeklyActions[token];
        delete monthlyActions[token];
    };

    // Unconditionally runs all registered actions of a given type.
    function runActions(frequencyType) {
        var actionSource = {};
        switch(frequencyType) {
            case "daily":
                actionSource = dailyActions;
                break;
            case "weekly":
                actionSource = weeklyActions;
                break;
            case "monthly":
                actionSource = monthlyActions;
                break;
            default:
            throw "Specified unknown frequency: " + frequency;
        }

        var entry = {};
        for (var token in actionSource) {
            entry = actionSource[token];
            entry.callback()
        }
    };

    // Performs a "tic" of a given frequency type.  Actions are run when enough tics have elapsed.
    function doTic(frequencyType) {
        console.log("doing a tic")

        var actionSource = {};
        switch(frequencyType) {
            case "daily":
                actionSource = dailyActions;
                break;
            case "weekly":
                actionSource = weeklyActions;
                break;
            case "monthly":
                actionSource = monthlyActions;
                break;
            default:
            throw "Specified unknown frequency: " + frequency;
        }

        // Decrement ticsRemaining for each registered SchedulerEntry.  
        // If zero tics remain, then it's time to do the callback and reset the tic counter.
        var entry = {};
        for (var token in actionSource) {
            entry = actionSource[token];
            --entry.ticsRemaining;
            if (entry.ticsRemaining == 0) {
                entry.callback()
                entry.ticsRemaining = entry.frequency;
            }
        }
    };

    // Runs the scheduler for events of a given type.  If a frequencyOverride is passed,
    // then the scheduler will run the events with the given frequency rather than the
    // default frequency for the frequency type.  Returns timeToNextTic as a testing hook.
    function runScheduler(frequencyType, frequencyOverride) {
        var scheduleIt = function() {
            var now = new Date();
            var nextTicTime = new Date();
            nextTicTime.setMinutes(0);
            nextTicTime.setSeconds(0);
            switch (frequencyType) {
                case "daily":
                    nextTicTime.setHours(24);
                    break;
                case "weekly":
                    nextTicTime.setHours(0);
                    var daysToNextAction = weeklyActionDay - now.getDay();
                    if (daysToNextAction <= 0) { daysToNextAction += 7 };
                    nextTicTime.setDate(now.getDate() + daysToNextAction);
                    break;
                case "monthly":
                    nextTicTime.setHours(0);
                    nextTicTime.setDate(1);
                    nextTicTime.setMonth(now.getMonth() + 1);
                    break;
            }
            var timeToNextTic = (nextTicTime.getTime() - now.getTime())
            if (frequencyOverride) { timeToNextTic = frequencyOverride } 

            // TODO:  Figure out how to cancel this if someone changes the state from running.
            Meteor.setTimeout(function() {
                if (schedulerState === "running") {
                    doTic(frequencyType);
                    scheduleIt();
                }
            }, timeToNextTic);

            return timeToNextTic;
        }

        return scheduleIt();
    };

    // TODO:  Seriously, figure out how to properly do ENUMs in Javascript.  Freeform text insertion is an awful API.
    function setSchedulerState(state) {
        schedulerState = state;
    };

    return {
        registerAction,
        unregisterAction,
        runActions,
        doTic,
        runScheduler,
        setSchedulerState
    }

}();

function generateUUID(){
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}
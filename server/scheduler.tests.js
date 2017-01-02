import { Scheduler } from './scheduler.js'

import { assert } from 'meteor/practicalmeteor:chai';

if (Meteor.isServer) {
    describe('scheduler tests', () => {
        it('can register/unregister daily tasks', () => {
            var nTimesActionRan = 0;
            var nTimesActionShouldRun = 1;

            var token = Scheduler.registerAction(() => {++nTimesActionRan}, 1, "daily");
            Scheduler.runActions("daily");

            Scheduler.unregisterAction(token);
            Scheduler.runActions("weekly");

            assert.equal(nTimesActionRan, nTimesActionShouldRun, "Action did not run the correct number of times");        
        });

        it('can register/unregister weekly tasks', () => {
            var nTimesActionRan = 0;
            var nTimesActionShouldRun = 1;

            var token = Scheduler.registerAction(() => {++nTimesActionRan}, 1, "weekly");
            Scheduler.runActions("weekly");

            Scheduler.unregisterAction(token);
            Scheduler.runActions("weekly");
            
            assert.equal(nTimesActionRan, nTimesActionShouldRun, "Action did not run the correct number of times");
        });

        it('can register/unregister monthly tasks', () => {
            var nTimesActionRan = 0;
            var nTimesActionShouldRun = 1;

            var token = Scheduler.registerAction(() => {++nTimesActionRan}, 1, "monthly");
            Scheduler.runActions("monthly");

            Scheduler.unregisterAction(token);
            Scheduler.runActions("weekly");

            assert.equal(nTimesActionRan, nTimesActionShouldRun, "Action did not run the correct number of times");
        });

        it('time deltas are calculated correctly', () => {
                var now = new Date();
                var tomorrow = new Date();
                var nextThursday = new Date();
                var nextMonth = new Date();

                tomorrow.setSeconds(0);
                tomorrow.setMinutes(0);
                tomorrow.setHours(24);

                var idxThursday = 4;
                var daysUntilThursday = idxThursday - now.getDay()
                if (daysUntilThursday <= 0) { daysUntilThursday += 7; }
                nextThursday.setSeconds(0);
                nextThursday.setMinutes(0);
                nextThursday.setHours(0);
                nextThursday.setDate(now.getDate() + daysUntilThursday )

                nextMonth.setSeconds(0);
                nextMonth.setMinutes(0);
                nextMonth.setHours(0);
                nextMonth.setDate(1);
                nextMonth.setMonth(now.getMonth() + 1);

                // switch (frequencyType) {
                //     case "daily":
                //         nextTicTime.setHours(24);
                //     break;
                //     case "weekly":
                //         nextTicTime.setHours(0);
                //         var daysToNextAction = weeklyActionDay - getDay();
                //         if (daysToNextAction <= 0) { daysToNextAction += 7 };
                //         nextTicTime.setDate(nextTicTime.getDate() + daysToNextAction);
                //     case "monthly":
                //         nextTicTime.setHours(0);
                //         nextTicTime.setDate(0);
                //         nextTicTime.setMonth(nextTicTime.getMonth() + 1);
                //     break;
                // }
                // var timeToNextTic = (nextTicTime.getTime() - new Date().getTime())

            var expectedDayDelta = tomorrow-now;
            var actualDayDelta = Scheduler.runScheduler("daily");

            var expectedWeekDelta = nextThursday-now;
            var actualWeekDelta = Scheduler.runScheduler("weekly");

            var expectedMonthDelta = nextMonth-now;
            var actualMonthDelta = Scheduler.runScheduler("monthly");

            assert(Math.abs(actualDayDelta - expectedDayDelta) < 1, "Daily Scheduler delta not within tolerance.  Expected " + expectedDayDelta + " got " + actualDayDelta );
            assert(Math.abs(actualWeekDelta - expectedWeekDelta) < 1, "Weekly Scheduler delta not within tolerance.  Expected " + expectedWeekDelta + " got " + actualWeekDelta );
            assert(Math.abs(actualMonthDelta - expectedMonthDelta) < 1, "Monthly Scheduler delta not within tolerance.  Expected " + expectedMonthDelta + " got " + actualMonthDelta );
        }) 

    });
}
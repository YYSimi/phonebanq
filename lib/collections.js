Senators = new Mongo.Collection("senators");
Representatives = new Mongo.Collection("representatives");
DailyCallPrompts = new Mongo.Collection("dailyCallPrompts");
//TODO:  Rename call prompts to weekly call prompts for production version.
WeeklyCallPrompts = new Mongo.Collection("callPrompts");
CustomCallers = new Mongo.Collection("customCallers");
UserTasks = new Mongo.Collection("userTasks");
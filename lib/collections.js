Senators = new Mongo.Collection("senators", { idGeneration: 'MONGO' });
Representatives = new Mongo.Collection("representatives", { idGeneration: 'MONGO' });

CustomCallers = new Mongo.Collection("customCallers", { idGeneration: 'MONGO' });
UserTasks = new Mongo.Collection("userTasks", { idGeneration: 'MONGO' });
Tasks = new Mongo.Collection("tasks", { idGeneration: 'MONGO' });
PhoneTasks = new Mongo.Collection("phoneTasks", { idGeneration: 'MONGO' });
TaskStatistics = new Mongo.Collection("taskStatistics", { idGeneration: 'MONGO' });
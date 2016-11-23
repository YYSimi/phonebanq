# PhoneBanq

Prototype site/Facebook app for prompting constituents become advocates for issues by calling their representatives.

TODO: Write a better project description

## Installation

1. [Install Meteor.js](https://www.meteor.com/install)
2. [Install MongoDB (Community Edition)](https://www.mongodb.com/download-center)
3. Start site: ```meteor run```
4. Import initial data

```
mongoimport -h localhost:3001 --db meteor --collection senators --type csv --file private/csv/national_senators.csv --headerline
mongoimport -h localhost:3001 --db meteor --collection dailyCallPrompts --type csv --file private/csv/dailyCallScripts.csv --headerline
mongoimport -h localhost:3001 --db meteor --collection callPrompts --type csv --file private/csv/weeklyCtA.csv --headerline
mongoimport -h localhost:3001 --db meteor --collection customCallers --type csv --file private/csv/customCallers.csv --headerline
```

5. Open the site in your browser: <http://localhost:3000/>
6. Click sign-in and hit "Register Facebook". Register as a Facebook dev and create a Facebook app to get a app id and secret

## License

TODO

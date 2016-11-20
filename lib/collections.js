Senators = new Mongo.Collection("senators");

function user(id, name, state, district) {
    this.id = id; //Primary Key
    this.name = name;
    this.state = state;
    this.district = district;
}
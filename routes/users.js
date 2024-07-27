const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/Pinterest");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
  },
  name: {
    type: String,
    required: true
  },
  posts: [{
    type : mongoose.Schema.Types.ObjectId,
    ref : 'Post'
  }],
  profileImg: {
    type: String 
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  bio:{
    type:String,
  },
  website :{
    type: String,
  },
  instagram :{
    type: String,
  },
  facebook :{
    type: String,
  },
  linkedin :{
    type: String,
  },
});

userSchema.plugin(plm);

const User = mongoose.model('User', userSchema);

module.exports = User;


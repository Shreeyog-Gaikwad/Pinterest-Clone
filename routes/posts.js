const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description:{
    type: String,
  },
  image : {
    type :String
  },
  likes: {
    type: Array,
    default: []
  },
  user : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Post = mongoose.model('Post', postSchema);
module.exports = Post;

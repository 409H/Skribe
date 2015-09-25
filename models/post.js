var mongoose = require('mongoose');

var shortId = require('shortid');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var PostSchema = new Schema({
  _id: {
      type: String,
      unique: true,
      'default': shortId.generate
  },
  title: String,
  body: String,
  private: Boolean,
  user: { type: ObjectId, ref: 'User' },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now }
});

PostSchema.pre('save', function(next) {
  this.updated = Date.now();
  next();
});

var Post = mongoose.model('Post', PostSchema);


module.exports = Post;

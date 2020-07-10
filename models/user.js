const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
mongoose.set('useFindAndModify', false)

const userSchema = new mongoose.Schema({
  name: String,
  username: {
    type: String,
    required: true,
    minlength: 3,
    unique: true
  },
  passwordHash: {
    type: String,
    // required: true,
    // minlength: 3
  },
  blogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog'
    }
  ],
})


userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    // the passwordHash should not be revealed
    delete returnedObject.passwordHash
  }
})

userSchema.plugin(uniqueValidator)
const User = mongoose.model('User', userSchema)

module.exports = User
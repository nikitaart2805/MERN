const {Schema, model, Types} = require('mongoose')

const schema = new Schema({
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  amztoken: {type: String, required: false},
  frc: {type:String, required:false},
  SN : {type:String, required:false},
  area : {type:String, required:false},
  refreshtoken :{type:String, required:false}
})

module.exports = model('User', schema)

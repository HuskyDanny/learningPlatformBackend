const mongoose = require("mongoose");
const validator = require("validator");
const Joi = require("joi");

const OTCSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        return new Error("Email is not valid");
      }
    }
  },
  confirmation: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 6
  }
});

OTCSchema.methods.setCmf = function(confirmation) {
  this.confirmation = confirmation;
}

OTCSchema.methods.validateCmf = function(confirmation) {
  return this.confirmation === confirmation;
};

const OTC = mongoose.model("OTC", OTCSchema);

const validateOTC = OTC => {
  const joiOTCSchema = {
    email: Joi.string()
      .required()
      .email(),
    confirmation: Joi.string()
      .required()
      .min(6)
      .max(6)
  };
  return Joi.validate(OTC, joiOTCSchema);
};

module.exports.OTC = OTC;
module.exports.OTCValidator = validateOTC;
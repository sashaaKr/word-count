const { Joi, Segments } = require('celebrate');

const counter = {
  [Segments.QUERY]: {
    term: Joi.string().lowercase().required()
  }
};

module.exports = {
  counter
}
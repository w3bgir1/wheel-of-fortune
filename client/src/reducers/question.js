import {ADD_QUESTION} from '../actions/questions'


export default (state = null, {type, payload}) => {
    switch (type) {
      case ADD_QUESTION:
        return payload
  
      default:
        return state
    }
  }
  
import * as request from "superagent";

export const ADD_QUESTION = "ADD_QUESTION";

const addQuestion = data => ({
  type: ADD_QUESTION,
  payload: data
});

export const getQuestion = () => dispatch => {
  const req = () => {
    request
    .get(`https://opentdb.com/api.php?amount=1&difficulty=easy&type=multiple`)
    .then(result => {
      console.log("got data");
      const answ = result.body.results[0].correct_answer;
      if (/^[a-zA-Z\s]+$/.test(answ) && answ.length < 13) {
        console.log("data correct");
        const temp = answ.split("").map(char => (char === " " ? " " : "_"));
        const data = {
          question: result.body.results[0].question,
          answer: result.body.results[0].correct_answer.toUpperCase(),
          template: temp
        };
        dispatch(addQuestion(data));
      } else {
        console.log('wrong data')
        req()
      }
    })
    .catch(err => console.error(err));  
  }
  req()
};

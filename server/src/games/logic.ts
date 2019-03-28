export const calculateWinner = (template: String, correctAnswer: string) =>
  template === correctAnswer ? true : false;

export const checkLetter = (letter: string, correctAnswer: string) => {
  return correctAnswer.includes(letter);
};

export const deleteFromAlphabet = (letter: string, alphabet: string[]) => {
  return alphabet.filter(el => el !== letter);
};

export const updateTemplate = (letter: string, correctAnswer: string, template: string) => {
  let newTemp = template.split("");
  const indexes = correctAnswer.split("").reduce((acc: number[], el: string, i: number) => {
    if (el === letter) {
      return acc.concat(i);
    }
    return acc;
  }, []);
  indexes.map(i => {
    newTemp[i] = letter;
  });
  return newTemp.join('')
}

module.exports = { romanise }

const conversions = {
  1: 'i',
  2: 'ii',
  3: 'iii',
  4: 'iv',
  5: 'v',
  6: 'vi',
  7: 'vii',
  8: 'viii',
  9: 'ix',
  10: 'x',
  11: 'xi',
  14: 'xiv',
  15: 'xv',
  16: 'xvi',
  19: 'xix',
  20: 'xx',
  21: 'xxi',
  22: 'xxii',
  23: 'xxiii',
  24: 'xxiv',
  25: 'xxv',
  26: 'xxvi',
  27: 'xxvii',
  28: 'xxviii',
  29: 'xxix',
  30: 'xxx',
  31: 'xxxi',
  32: 'xxxii',
  33: 'xxxiii',
  34: 'xxxiv',
  35: 'xxxv',
  36: 'xxxvi',
  37: 'xxxvii',
  38: 'xxxviii',
  39: 'xxxix',
  40: 'xl',
  41: 'xli',
  42: 'xlii',
  43: 'xliii',
  44: 'xliv',
  45: 'xlv',
  46: 'xlvi',
  47: 'xlvii',
  48: 'xlviii',
  49: 'xlix',
  50: 'l',
}

function romanise(number) {
  if (number < 1 || number > 50) {
    throw new Error('Input must be in range 1 to 50')
  }

  return conversions[number]
}

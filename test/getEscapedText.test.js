function getEscapedText(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\\/g, '&#92;')
}

describe('getEscapedText', () => {
  test('should return true if all expected answers are Yes', () => {
    expect(getEscapedText('Text')).toStrictEqual('Text')
    expect(getEscapedText('Text &')).toStrictEqual('Text &amp;')
    expect(getEscapedText('Text <')).toStrictEqual('Text &lt;')
    expect(getEscapedText('Text >')).toStrictEqual('Text &gt;')
    expect(getEscapedText('Text "')).toStrictEqual('Text &quot;')
    expect(getEscapedText(`Text '`)).toStrictEqual('Text &#39;')
    expect(getEscapedText('Text \\')).toStrictEqual('Text &#92;')
    expect(getEscapedText('')).toStrictEqual('')
    expect(getEscapedText('\\Text\\')).toStrictEqual('&#92;Text&#92;')
    expect(getEscapedText('<i>Text</i>')).toStrictEqual('&lt;i&gt;Text&lt;/i&gt;')
    expect(getEscapedText('<script></script>')).toStrictEqual('&lt;script&gt;&lt;/script&gt;')
  })
})

const { sendingUserName } = require('../../server/utils/userProfile')

describe('sendingUserName', () => {
  test('should extract username from user', () => {
    expect(sendingUserName({ username: 'A' })).toBe('A')
  })

  test('should extract name from user', () => {
    expect(sendingUserName({ username: 'A', name: 'B' })).toBe('B')
  })

  test('should fall back to username when name is not a string', () => {
    expect(
      sendingUserName({
        username: 'A',
        name: {
          familyName: 'C',
          givenName: 'D',
        },
      })
    ).toBe('A')
  })
})

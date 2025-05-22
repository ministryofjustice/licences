const { sendingUserName, forenameToInitial } = require('../../server/utils/userProfile')

describe('Forename to initial', () => {
  it('should return null', () => {
    expect(forenameToInitial('')).toEqual(null)
  })
  it('should change forename to initial', () => {
    expect(forenameToInitial('Test Person')).toEqual('T. Person')
  })
  it('should change forename to initial hypenated last name', () => {
    expect(forenameToInitial('Test Person-One')).toEqual('T. Person-One')
  })
})

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

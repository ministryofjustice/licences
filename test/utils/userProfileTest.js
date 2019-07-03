const { sendingUserName } = require('../../server/utils/userProfile')

describe('sendingUserName', () => {
  it('should extract username from user', () => {
    expect(sendingUserName({ username: 'A' })).to.eql('A')
  })

  it('should extract name from user', () => {
    expect(sendingUserName({ username: 'A', name: 'B' })).to.eql('B')
  })

  it('should fall back to username when name is not a string', () => {
    expect(
      sendingUserName({
        username: 'A',
        name: {
          familyName: 'C',
          givenName: 'D',
        },
      })
    ).to.eql('A')
  })
})

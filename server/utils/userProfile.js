module.exports = {
  /*
   * Extract the given name for a user. Expects a 'user' object - the object returned in the
   * passport.authenticate callback.  This has name and username properties.
   * The name property appears to be a single string like '<firstname> <lastName>'.
   * So, if 'name' is a string use that, otherwise fall back to using username.
   */
  sendingUserName: (user) => (typeof user.name === 'string' && user.name) || user.username,
}

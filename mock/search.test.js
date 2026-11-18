const { matchUsers } = require('./routes/search')

describe('mock people search', () => {
  it('matches username or name case-insensitively and ignores blank terms', () => {
    expect(matchUsers('ADA').map(u => u.username)).toContain('ada')
    expect(matchUsers('   ')).toEqual([])
    expect(matchUsers('zzzzzz')).toEqual([])
  })
})

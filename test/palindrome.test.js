const { palindrome } = require('../utils/for_testing');

test('palindrome of benjamin', () => {
  const result = palindrome('benjamin');

  expect(result).toBe('nimajneb');
});

test('palindrome of empty string', () => {
  const result = palindrome('');

  expect(result).toBe('');
});

test('palindrome of undefined', () => {
  const result = palindrome();

  expect(result).toBeUndefined();
});

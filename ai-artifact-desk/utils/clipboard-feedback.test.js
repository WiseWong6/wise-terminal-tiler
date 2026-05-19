import test from 'node:test';
import assert from 'node:assert/strict';

import {
  collectClipboardTypes,
  findAcceptedClipboardType,
  formatClipboardVerificationError,
} from './clipboard-feedback.js';

test('collectClipboardTypes keeps unique clipboard mime types in encounter order', () => {
  const types = collectClipboardTypes([
    { types: ['text/html', 'text/plain'] },
    { types: ['image/png', 'text/html'] },
    { types: ['image/png'] },
  ]);

  assert.deepEqual(types, ['text/html', 'text/plain', 'image/png']);
});

test('findAcceptedClipboardType returns the first acceptable clipboard type', () => {
  const matchedType = findAcceptedClipboardType(
    ['text/plain', 'text/html', 'image/png'],
    ['image/png', 'text/html'],
  );

  assert.equal(matchedType, 'image/png');
});

test('formatClipboardVerificationError includes expected and available clipboard types', () => {
  const message = formatClipboardVerificationError(
    ['image/png', 'text/html'],
    ['text/plain'],
  );

  assert.equal(
    message,
    'Clipboard verification failed: expected one of image/png, text/html but found text/plain.',
  );
});

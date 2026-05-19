/**
 * Collect unique clipboard MIME types in encounter order.
 *
 * @param {ArrayLike<{ types?: ArrayLike<string> | null }> | null | undefined} items
 * @returns {string[]}
 */
export const collectClipboardTypes = (items) => {
  const collectedTypes = [];
  const seenTypes = new Set();

  for (const item of items ?? []) {
    for (const type of item?.types ?? []) {
      if (typeof type !== 'string' || seenTypes.has(type)) continue;
      seenTypes.add(type);
      collectedTypes.push(type);
    }
  }

  return collectedTypes;
};

/**
 * Find the first accepted clipboard MIME type that is available.
 *
 * @param {readonly string[]} availableTypes
 * @param {readonly string[]} acceptedTypes
 * @returns {string | null}
 */
export const findAcceptedClipboardType = (availableTypes, acceptedTypes) => {
  const availableTypeSet = new Set(availableTypes);

  for (const acceptedType of acceptedTypes) {
    if (availableTypeSet.has(acceptedType)) {
      return acceptedType;
    }
  }

  return null;
};

/**
 * Build a readable clipboard verification failure message.
 *
 * @param {readonly string[]} acceptedTypes
 * @param {readonly string[]} availableTypes
 * @returns {string}
 */
export const formatClipboardVerificationError = (acceptedTypes, availableTypes) => {
  const expected = acceptedTypes.join(', ');
  const actual = availableTypes.length > 0 ? availableTypes.join(', ') : 'nothing readable';
  return `Clipboard verification failed: expected one of ${expected} but found ${actual}.`;
};

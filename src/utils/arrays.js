/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

export const last = array => array[array.length - 1];

export const isEqual = (first, second) => (
  JSON.stringify(first) === JSON.stringify(second)
);

export const allItemsFromIncludedIn = (first, second, property = 'id') => {
  first.every(tag => second.find(t => t[property] === tag[property]));
};

export const removeDuplicatesBy = (target, property) => target.filter((value, index, array) => (
  array.findIndex(v2 => (v2[property] === value[property])) === index
));

export const shallowMergeByProperty = (first, second, property = 'id') => (
  removeDuplicatesBy([].concat(first, second), property)
);

export const removeDuplicatesFromArrayBy = (first, second, property = 'id') => (
  first.filter(tag => !second.find(secondTag => secondTag[property] === tag[property]))
);

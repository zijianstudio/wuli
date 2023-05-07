// Copyright 2013-2021, University of Colorado Boulder

/**
 * Helper type for managing the list of atom values that can be used for
 * creating game challenges.  The two main pieces of functionality added by
 * this class is that it removes items from the enclosed list automatically,
 * and it keeps track of what we removed in case it ends up being needed
 * again.
 *
 * @author John Blanco
 */

import dotRandom from '../../../../dot/js/dotRandom.js';
import NumberAtom from '../../../../shred/js/model/NumberAtom.js';
import buildAnAtom from '../../buildAnAtom.js';

// Challenge pools for creating game challenges, extracted from the design doc.
// These define the configuration for each of the challenges that can be used
// in a challenge set for a given sub-game.
const CHALLENGE_POOLS = [[new NumberAtom({
  protonCount: 1,
  neutronCount: 0,
  electronCount: 0
}), new NumberAtom({
  protonCount: 1,
  neutronCount: 0,
  electronCount: 1
}), new NumberAtom({
  protonCount: 1,
  neutronCount: 0,
  electronCount: 2
}), new NumberAtom({
  protonCount: 1,
  neutronCount: 1,
  electronCount: 0
}), new NumberAtom({
  protonCount: 1,
  neutronCount: 1,
  electronCount: 1
}), new NumberAtom({
  protonCount: 1,
  neutronCount: 1,
  electronCount: 2
}), new NumberAtom({
  protonCount: 2,
  neutronCount: 1,
  electronCount: 2
}), new NumberAtom({
  protonCount: 2,
  neutronCount: 2,
  electronCount: 2
}), new NumberAtom({
  protonCount: 3,
  neutronCount: 3,
  electronCount: 2
}), new NumberAtom({
  protonCount: 3,
  neutronCount: 3,
  electronCount: 3
}), new NumberAtom({
  protonCount: 3,
  neutronCount: 4,
  electronCount: 2
}), new NumberAtom({
  protonCount: 3,
  neutronCount: 4,
  electronCount: 3
}), new NumberAtom({
  protonCount: 4,
  neutronCount: 5,
  electronCount: 4
}), new NumberAtom({
  protonCount: 5,
  neutronCount: 5,
  electronCount: 5
}), new NumberAtom({
  protonCount: 5,
  neutronCount: 6,
  electronCount: 5
}), new NumberAtom({
  protonCount: 6,
  neutronCount: 6,
  electronCount: 6
}), new NumberAtom({
  protonCount: 6,
  neutronCount: 7,
  electronCount: 6
}), new NumberAtom({
  protonCount: 7,
  neutronCount: 7,
  electronCount: 7
}), new NumberAtom({
  protonCount: 7,
  neutronCount: 7,
  electronCount: 10
}), new NumberAtom({
  protonCount: 7,
  neutronCount: 8,
  electronCount: 7
}), new NumberAtom({
  protonCount: 7,
  neutronCount: 8,
  electronCount: 10
}), new NumberAtom({
  protonCount: 8,
  neutronCount: 8,
  electronCount: 8
}), new NumberAtom({
  protonCount: 8,
  neutronCount: 8,
  electronCount: 10
}), new NumberAtom({
  protonCount: 8,
  neutronCount: 9,
  electronCount: 8
}), new NumberAtom({
  protonCount: 8,
  neutronCount: 9,
  electronCount: 10
}), new NumberAtom({
  protonCount: 8,
  neutronCount: 10,
  electronCount: 8
}), new NumberAtom({
  protonCount: 8,
  neutronCount: 10,
  electronCount: 10
}), new NumberAtom({
  protonCount: 9,
  neutronCount: 10,
  electronCount: 9
}), new NumberAtom({
  protonCount: 9,
  neutronCount: 10,
  electronCount: 10
}), new NumberAtom({
  protonCount: 10,
  neutronCount: 10,
  electronCount: 10
}), new NumberAtom({
  protonCount: 10,
  neutronCount: 11,
  electronCount: 10
}), new NumberAtom({
  protonCount: 10,
  neutronCount: 12,
  electronCount: 10
})], [new NumberAtom({
  protonCount: 1,
  neutronCount: 0,
  electronCount: 0
}), new NumberAtom({
  protonCount: 1,
  neutronCount: 0,
  electronCount: 1
}), new NumberAtom({
  protonCount: 1,
  neutronCount: 0,
  electronCount: 2
}), new NumberAtom({
  protonCount: 1,
  neutronCount: 1,
  electronCount: 0
}), new NumberAtom({
  protonCount: 1,
  neutronCount: 1,
  electronCount: 1
}), new NumberAtom({
  protonCount: 1,
  neutronCount: 1,
  electronCount: 2
}), new NumberAtom({
  protonCount: 2,
  neutronCount: 1,
  electronCount: 2
}), new NumberAtom({
  protonCount: 2,
  neutronCount: 2,
  electronCount: 2
}), new NumberAtom({
  protonCount: 3,
  neutronCount: 3,
  electronCount: 2
}), new NumberAtom({
  protonCount: 3,
  neutronCount: 3,
  electronCount: 3
}), new NumberAtom({
  protonCount: 3,
  neutronCount: 4,
  electronCount: 2
}), new NumberAtom({
  protonCount: 3,
  neutronCount: 4,
  electronCount: 3
}), new NumberAtom({
  protonCount: 4,
  neutronCount: 5,
  electronCount: 4
}), new NumberAtom({
  protonCount: 5,
  neutronCount: 5,
  electronCount: 5
}), new NumberAtom({
  protonCount: 5,
  neutronCount: 6,
  electronCount: 5
}), new NumberAtom({
  protonCount: 6,
  neutronCount: 6,
  electronCount: 6
}), new NumberAtom({
  protonCount: 6,
  neutronCount: 7,
  electronCount: 6
}), new NumberAtom({
  protonCount: 7,
  neutronCount: 7,
  electronCount: 7
}), new NumberAtom({
  protonCount: 7,
  neutronCount: 7,
  electronCount: 10
}), new NumberAtom({
  protonCount: 7,
  neutronCount: 8,
  electronCount: 7
}), new NumberAtom({
  protonCount: 7,
  neutronCount: 8,
  electronCount: 10
}), new NumberAtom({
  protonCount: 8,
  neutronCount: 8,
  electronCount: 8
}), new NumberAtom({
  protonCount: 8,
  neutronCount: 8,
  electronCount: 10
}), new NumberAtom({
  protonCount: 8,
  neutronCount: 9,
  electronCount: 8
}), new NumberAtom({
  protonCount: 8,
  neutronCount: 9,
  electronCount: 10
}), new NumberAtom({
  protonCount: 8,
  neutronCount: 10,
  electronCount: 8
}), new NumberAtom({
  protonCount: 8,
  neutronCount: 10,
  electronCount: 10
}), new NumberAtom({
  protonCount: 9,
  neutronCount: 10,
  electronCount: 9
}), new NumberAtom({
  protonCount: 9,
  neutronCount: 10,
  electronCount: 10
}), new NumberAtom({
  protonCount: 10,
  neutronCount: 10,
  electronCount: 10
}), new NumberAtom({
  protonCount: 10,
  neutronCount: 11,
  electronCount: 10
}), new NumberAtom({
  protonCount: 10,
  neutronCount: 12,
  electronCount: 10
})], [new NumberAtom({
  protonCount: 1,
  neutronCount: 0,
  electronCount: 0
}), new NumberAtom({
  protonCount: 1,
  neutronCount: 0,
  electronCount: 1
}), new NumberAtom({
  protonCount: 1,
  neutronCount: 0,
  electronCount: 2
}), new NumberAtom({
  protonCount: 1,
  neutronCount: 1,
  electronCount: 0
}), new NumberAtom({
  protonCount: 1,
  neutronCount: 1,
  electronCount: 1
}), new NumberAtom({
  protonCount: 1,
  neutronCount: 1,
  electronCount: 2
}), new NumberAtom({
  protonCount: 2,
  neutronCount: 1,
  electronCount: 2
}), new NumberAtom({
  protonCount: 2,
  neutronCount: 2,
  electronCount: 2
}), new NumberAtom({
  protonCount: 3,
  neutronCount: 3,
  electronCount: 2
}), new NumberAtom({
  protonCount: 3,
  neutronCount: 3,
  electronCount: 3
}), new NumberAtom({
  protonCount: 3,
  neutronCount: 4,
  electronCount: 2
}), new NumberAtom({
  protonCount: 3,
  neutronCount: 4,
  electronCount: 3
}), new NumberAtom({
  protonCount: 4,
  neutronCount: 5,
  electronCount: 4
}), new NumberAtom({
  protonCount: 5,
  neutronCount: 5,
  electronCount: 5
}), new NumberAtom({
  protonCount: 5,
  neutronCount: 6,
  electronCount: 5
}), new NumberAtom({
  protonCount: 6,
  neutronCount: 6,
  electronCount: 6
}), new NumberAtom({
  protonCount: 6,
  neutronCount: 7,
  electronCount: 6
}), new NumberAtom({
  protonCount: 7,
  neutronCount: 7,
  electronCount: 7
}), new NumberAtom({
  protonCount: 7,
  neutronCount: 7,
  electronCount: 10
}), new NumberAtom({
  protonCount: 7,
  neutronCount: 8,
  electronCount: 7
}), new NumberAtom({
  protonCount: 7,
  neutronCount: 8,
  electronCount: 10
}), new NumberAtom({
  protonCount: 8,
  neutronCount: 8,
  electronCount: 8
}), new NumberAtom({
  protonCount: 8,
  neutronCount: 8,
  electronCount: 10
}), new NumberAtom({
  protonCount: 8,
  neutronCount: 9,
  electronCount: 8
}), new NumberAtom({
  protonCount: 8,
  neutronCount: 9,
  electronCount: 10
}), new NumberAtom({
  protonCount: 8,
  neutronCount: 10,
  electronCount: 8
}), new NumberAtom({
  protonCount: 8,
  neutronCount: 10,
  electronCount: 10
}), new NumberAtom({
  protonCount: 9,
  neutronCount: 10,
  electronCount: 9
}), new NumberAtom({
  protonCount: 9,
  neutronCount: 10,
  electronCount: 10
}), new NumberAtom({
  protonCount: 10,
  neutronCount: 10,
  electronCount: 10
}), new NumberAtom({
  protonCount: 10,
  neutronCount: 11,
  electronCount: 10
}), new NumberAtom({
  protonCount: 10,
  neutronCount: 12,
  electronCount: 10
}), new NumberAtom({
  protonCount: 11,
  neutronCount: 12,
  electronCount: 10
}), new NumberAtom({
  protonCount: 11,
  neutronCount: 12,
  electronCount: 11
}), new NumberAtom({
  protonCount: 12,
  neutronCount: 12,
  electronCount: 10
}), new NumberAtom({
  protonCount: 12,
  neutronCount: 12,
  electronCount: 12
}), new NumberAtom({
  protonCount: 12,
  neutronCount: 13,
  electronCount: 10
}), new NumberAtom({
  protonCount: 12,
  neutronCount: 13,
  electronCount: 12
}), new NumberAtom({
  protonCount: 12,
  neutronCount: 14,
  electronCount: 10
}), new NumberAtom({
  protonCount: 12,
  neutronCount: 14,
  electronCount: 12
}), new NumberAtom({
  protonCount: 13,
  neutronCount: 14,
  electronCount: 10
}), new NumberAtom({
  protonCount: 13,
  neutronCount: 14,
  electronCount: 13
}), new NumberAtom({
  protonCount: 14,
  neutronCount: 14,
  electronCount: 14
}), new NumberAtom({
  protonCount: 14,
  neutronCount: 15,
  electronCount: 14
}), new NumberAtom({
  protonCount: 14,
  neutronCount: 16,
  electronCount: 14
}), new NumberAtom({
  protonCount: 15,
  neutronCount: 16,
  electronCount: 15
}), new NumberAtom({
  protonCount: 16,
  neutronCount: 16,
  electronCount: 16
}), new NumberAtom({
  protonCount: 16,
  neutronCount: 16,
  electronCount: 18
}), new NumberAtom({
  protonCount: 16,
  neutronCount: 17,
  electronCount: 16
}), new NumberAtom({
  protonCount: 16,
  neutronCount: 17,
  electronCount: 18
}), new NumberAtom({
  protonCount: 16,
  neutronCount: 18,
  electronCount: 16
}), new NumberAtom({
  protonCount: 16,
  neutronCount: 18,
  electronCount: 18
}), new NumberAtom({
  protonCount: 16,
  neutronCount: 19,
  electronCount: 16
}), new NumberAtom({
  protonCount: 16,
  neutronCount: 19,
  electronCount: 18
}), new NumberAtom({
  protonCount: 17,
  neutronCount: 18,
  electronCount: 17
}), new NumberAtom({
  protonCount: 17,
  neutronCount: 18,
  electronCount: 18
}), new NumberAtom({
  protonCount: 17,
  neutronCount: 20,
  electronCount: 17
}), new NumberAtom({
  protonCount: 17,
  neutronCount: 20,
  electronCount: 18
}), new NumberAtom({
  protonCount: 18,
  neutronCount: 20,
  electronCount: 18
}), new NumberAtom({
  protonCount: 18,
  neutronCount: 22,
  electronCount: 18
})], [new NumberAtom({
  protonCount: 1,
  neutronCount: 0,
  electronCount: 0
}), new NumberAtom({
  protonCount: 1,
  neutronCount: 0,
  electronCount: 1
}), new NumberAtom({
  protonCount: 1,
  neutronCount: 0,
  electronCount: 2
}), new NumberAtom({
  protonCount: 1,
  neutronCount: 1,
  electronCount: 0
}), new NumberAtom({
  protonCount: 1,
  neutronCount: 1,
  electronCount: 1
}), new NumberAtom({
  protonCount: 1,
  neutronCount: 1,
  electronCount: 2
}), new NumberAtom({
  protonCount: 2,
  neutronCount: 1,
  electronCount: 2
}), new NumberAtom({
  protonCount: 2,
  neutronCount: 2,
  electronCount: 2
}), new NumberAtom({
  protonCount: 3,
  neutronCount: 3,
  electronCount: 2
}), new NumberAtom({
  protonCount: 3,
  neutronCount: 3,
  electronCount: 3
}), new NumberAtom({
  protonCount: 3,
  neutronCount: 4,
  electronCount: 2
}), new NumberAtom({
  protonCount: 3,
  neutronCount: 4,
  electronCount: 3
}), new NumberAtom({
  protonCount: 4,
  neutronCount: 5,
  electronCount: 4
}), new NumberAtom({
  protonCount: 5,
  neutronCount: 5,
  electronCount: 5
}), new NumberAtom({
  protonCount: 5,
  neutronCount: 6,
  electronCount: 5
}), new NumberAtom({
  protonCount: 6,
  neutronCount: 6,
  electronCount: 6
}), new NumberAtom({
  protonCount: 6,
  neutronCount: 7,
  electronCount: 6
}), new NumberAtom({
  protonCount: 7,
  neutronCount: 7,
  electronCount: 7
}), new NumberAtom({
  protonCount: 7,
  neutronCount: 7,
  electronCount: 10
}), new NumberAtom({
  protonCount: 7,
  neutronCount: 8,
  electronCount: 7
}), new NumberAtom({
  protonCount: 7,
  neutronCount: 8,
  electronCount: 10
}), new NumberAtom({
  protonCount: 8,
  neutronCount: 8,
  electronCount: 8
}), new NumberAtom({
  protonCount: 8,
  neutronCount: 8,
  electronCount: 10
}), new NumberAtom({
  protonCount: 8,
  neutronCount: 9,
  electronCount: 8
}), new NumberAtom({
  protonCount: 8,
  neutronCount: 9,
  electronCount: 10
}), new NumberAtom({
  protonCount: 8,
  neutronCount: 10,
  electronCount: 8
}), new NumberAtom({
  protonCount: 8,
  neutronCount: 10,
  electronCount: 10
}), new NumberAtom({
  protonCount: 9,
  neutronCount: 10,
  electronCount: 9
}), new NumberAtom({
  protonCount: 9,
  neutronCount: 10,
  electronCount: 10
}), new NumberAtom({
  protonCount: 10,
  neutronCount: 10,
  electronCount: 10
}), new NumberAtom({
  protonCount: 10,
  neutronCount: 11,
  electronCount: 10
}), new NumberAtom({
  protonCount: 10,
  neutronCount: 12,
  electronCount: 10
}), new NumberAtom({
  protonCount: 11,
  neutronCount: 12,
  electronCount: 10
}), new NumberAtom({
  protonCount: 11,
  neutronCount: 12,
  electronCount: 11
}), new NumberAtom({
  protonCount: 12,
  neutronCount: 12,
  electronCount: 10
}), new NumberAtom({
  protonCount: 12,
  neutronCount: 12,
  electronCount: 12
}), new NumberAtom({
  protonCount: 12,
  neutronCount: 13,
  electronCount: 10
}), new NumberAtom({
  protonCount: 12,
  neutronCount: 13,
  electronCount: 12
}), new NumberAtom({
  protonCount: 12,
  neutronCount: 14,
  electronCount: 10
}), new NumberAtom({
  protonCount: 12,
  neutronCount: 14,
  electronCount: 12
}), new NumberAtom({
  protonCount: 13,
  neutronCount: 14,
  electronCount: 10
}), new NumberAtom({
  protonCount: 13,
  neutronCount: 14,
  electronCount: 13
}), new NumberAtom({
  protonCount: 14,
  neutronCount: 14,
  electronCount: 14
}), new NumberAtom({
  protonCount: 14,
  neutronCount: 15,
  electronCount: 14
}), new NumberAtom({
  protonCount: 14,
  neutronCount: 16,
  electronCount: 14
}), new NumberAtom({
  protonCount: 15,
  neutronCount: 16,
  electronCount: 15
}), new NumberAtom({
  protonCount: 16,
  neutronCount: 16,
  electronCount: 16
}), new NumberAtom({
  protonCount: 16,
  neutronCount: 16,
  electronCount: 18
}), new NumberAtom({
  protonCount: 16,
  neutronCount: 17,
  electronCount: 16
}), new NumberAtom({
  protonCount: 16,
  neutronCount: 17,
  electronCount: 18
}), new NumberAtom({
  protonCount: 16,
  neutronCount: 18,
  electronCount: 16
}), new NumberAtom({
  protonCount: 16,
  neutronCount: 18,
  electronCount: 18
}), new NumberAtom({
  protonCount: 16,
  neutronCount: 19,
  electronCount: 16
}), new NumberAtom({
  protonCount: 16,
  neutronCount: 19,
  electronCount: 18
}), new NumberAtom({
  protonCount: 17,
  neutronCount: 18,
  electronCount: 17
}), new NumberAtom({
  protonCount: 17,
  neutronCount: 18,
  electronCount: 18
}), new NumberAtom({
  protonCount: 17,
  neutronCount: 20,
  electronCount: 17
}), new NumberAtom({
  protonCount: 17,
  neutronCount: 20,
  electronCount: 18
}), new NumberAtom({
  protonCount: 18,
  neutronCount: 20,
  electronCount: 18
}), new NumberAtom({
  protonCount: 18,
  neutronCount: 22,
  electronCount: 18
})]];

/**
 * @param {number} level
 * @constructor
 */
function AtomValuePool(level) {
  this.remainingAtomValues = CHALLENGE_POOLS[level];
  this.usedAtomValues = [];
}

/**
 * Remove the specified atom value from the list of those available.
 *
 * @param atomValueToRemove
 */
AtomValuePool.prototype.markAtomAsUsed = function (atomValueToRemove) {
  if (this.remainingAtomValues.indexOf(atomValueToRemove) !== -1) {
    this.remainingAtomValues = _.without(this.remainingAtomValues, atomValueToRemove);
    this.usedAtomValues.push(atomValueToRemove);
  }
};

/**
 * Get a random atom value from the pool that matches the specified criteria.
 *
 * @param minProtonCount
 * @param maxProtonCount
 * @param requireCharged
 * @returns an atom that matches, or null if none exist in the pool
 * @public
 */
AtomValuePool.prototype.getRandomAtomValue = function (minProtonCount, maxProtonCount, requireCharged) {
  // Define a function that returns true if a given atom matches the criteria.
  const meetsCriteria = numberAtom => numberAtom.protonCountProperty.get() >= minProtonCount && numberAtom.protonCountProperty.get() < maxProtonCount && (!requireCharged || numberAtom.chargeProperty.get() !== 0);

  // Make a list of the atoms that meet the criteria.
  const allowableAtomValues = [];
  this.remainingAtomValues.forEach(numberAtom => {
    if (meetsCriteria(numberAtom)) {
      allowableAtomValues.push(numberAtom);
    }
  });
  if (allowableAtomValues.length === 0) {
    // There were none available on the list of unused atoms, so
    // add them from the list of used atoms instead.
    this.usedAtomValues.forEach(numberAtom => {
      if (meetsCriteria(numberAtom)) {
        allowableAtomValues.push(numberAtom);
      }
    });
  }

  // Choose a random value from the list.
  let atomValue = null;
  if (allowableAtomValues.length > 0) {
    atomValue = allowableAtomValues[Math.floor(dotRandom.nextDouble() * allowableAtomValues.length)];
  } else {
    throw new Error('Error: No atoms found that match the specified criteria');
  }
  return atomValue;
};
buildAnAtom.register('AtomValuePool', AtomValuePool);
export default AtomValuePool;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkb3RSYW5kb20iLCJOdW1iZXJBdG9tIiwiYnVpbGRBbkF0b20iLCJDSEFMTEVOR0VfUE9PTFMiLCJwcm90b25Db3VudCIsIm5ldXRyb25Db3VudCIsImVsZWN0cm9uQ291bnQiLCJBdG9tVmFsdWVQb29sIiwibGV2ZWwiLCJyZW1haW5pbmdBdG9tVmFsdWVzIiwidXNlZEF0b21WYWx1ZXMiLCJwcm90b3R5cGUiLCJtYXJrQXRvbUFzVXNlZCIsImF0b21WYWx1ZVRvUmVtb3ZlIiwiaW5kZXhPZiIsIl8iLCJ3aXRob3V0IiwicHVzaCIsImdldFJhbmRvbUF0b21WYWx1ZSIsIm1pblByb3RvbkNvdW50IiwibWF4UHJvdG9uQ291bnQiLCJyZXF1aXJlQ2hhcmdlZCIsIm1lZXRzQ3JpdGVyaWEiLCJudW1iZXJBdG9tIiwicHJvdG9uQ291bnRQcm9wZXJ0eSIsImdldCIsImNoYXJnZVByb3BlcnR5IiwiYWxsb3dhYmxlQXRvbVZhbHVlcyIsImZvckVhY2giLCJsZW5ndGgiLCJhdG9tVmFsdWUiLCJNYXRoIiwiZmxvb3IiLCJuZXh0RG91YmxlIiwiRXJyb3IiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkF0b21WYWx1ZVBvb2wuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogSGVscGVyIHR5cGUgZm9yIG1hbmFnaW5nIHRoZSBsaXN0IG9mIGF0b20gdmFsdWVzIHRoYXQgY2FuIGJlIHVzZWQgZm9yXHJcbiAqIGNyZWF0aW5nIGdhbWUgY2hhbGxlbmdlcy4gIFRoZSB0d28gbWFpbiBwaWVjZXMgb2YgZnVuY3Rpb25hbGl0eSBhZGRlZCBieVxyXG4gKiB0aGlzIGNsYXNzIGlzIHRoYXQgaXQgcmVtb3ZlcyBpdGVtcyBmcm9tIHRoZSBlbmNsb3NlZCBsaXN0IGF1dG9tYXRpY2FsbHksXHJcbiAqIGFuZCBpdCBrZWVwcyB0cmFjayBvZiB3aGF0IHdlIHJlbW92ZWQgaW4gY2FzZSBpdCBlbmRzIHVwIGJlaW5nIG5lZWRlZFxyXG4gKiBhZ2Fpbi5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKi9cclxuXHJcbmltcG9ydCBkb3RSYW5kb20gZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL2RvdFJhbmRvbS5qcyc7XHJcbmltcG9ydCBOdW1iZXJBdG9tIGZyb20gJy4uLy4uLy4uLy4uL3NocmVkL2pzL21vZGVsL051bWJlckF0b20uanMnO1xyXG5pbXBvcnQgYnVpbGRBbkF0b20gZnJvbSAnLi4vLi4vYnVpbGRBbkF0b20uanMnO1xyXG5cclxuLy8gQ2hhbGxlbmdlIHBvb2xzIGZvciBjcmVhdGluZyBnYW1lIGNoYWxsZW5nZXMsIGV4dHJhY3RlZCBmcm9tIHRoZSBkZXNpZ24gZG9jLlxyXG4vLyBUaGVzZSBkZWZpbmUgdGhlIGNvbmZpZ3VyYXRpb24gZm9yIGVhY2ggb2YgdGhlIGNoYWxsZW5nZXMgdGhhdCBjYW4gYmUgdXNlZFxyXG4vLyBpbiBhIGNoYWxsZW5nZSBzZXQgZm9yIGEgZ2l2ZW4gc3ViLWdhbWUuXHJcbmNvbnN0IENIQUxMRU5HRV9QT09MUyA9IFtcclxuICBbXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogMSwgbmV1dHJvbkNvdW50OiAwLCBlbGVjdHJvbkNvdW50OiAwIH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiAxLCBuZXV0cm9uQ291bnQ6IDAsIGVsZWN0cm9uQ291bnQ6IDEgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDEsIG5ldXRyb25Db3VudDogMCwgZWxlY3Ryb25Db3VudDogMiB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogMSwgbmV1dHJvbkNvdW50OiAxLCBlbGVjdHJvbkNvdW50OiAwIH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiAxLCBuZXV0cm9uQ291bnQ6IDEsIGVsZWN0cm9uQ291bnQ6IDEgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDEsIG5ldXRyb25Db3VudDogMSwgZWxlY3Ryb25Db3VudDogMiB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogMiwgbmV1dHJvbkNvdW50OiAxLCBlbGVjdHJvbkNvdW50OiAyIH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiAyLCBuZXV0cm9uQ291bnQ6IDIsIGVsZWN0cm9uQ291bnQ6IDIgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDMsIG5ldXRyb25Db3VudDogMywgZWxlY3Ryb25Db3VudDogMiB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogMywgbmV1dHJvbkNvdW50OiAzLCBlbGVjdHJvbkNvdW50OiAzIH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiAzLCBuZXV0cm9uQ291bnQ6IDQsIGVsZWN0cm9uQ291bnQ6IDIgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDMsIG5ldXRyb25Db3VudDogNCwgZWxlY3Ryb25Db3VudDogMyB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogNCwgbmV1dHJvbkNvdW50OiA1LCBlbGVjdHJvbkNvdW50OiA0IH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiA1LCBuZXV0cm9uQ291bnQ6IDUsIGVsZWN0cm9uQ291bnQ6IDUgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDUsIG5ldXRyb25Db3VudDogNiwgZWxlY3Ryb25Db3VudDogNSB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogNiwgbmV1dHJvbkNvdW50OiA2LCBlbGVjdHJvbkNvdW50OiA2IH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiA2LCBuZXV0cm9uQ291bnQ6IDcsIGVsZWN0cm9uQ291bnQ6IDYgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDcsIG5ldXRyb25Db3VudDogNywgZWxlY3Ryb25Db3VudDogNyB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogNywgbmV1dHJvbkNvdW50OiA3LCBlbGVjdHJvbkNvdW50OiAxMCB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogNywgbmV1dHJvbkNvdW50OiA4LCBlbGVjdHJvbkNvdW50OiA3IH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiA3LCBuZXV0cm9uQ291bnQ6IDgsIGVsZWN0cm9uQ291bnQ6IDEwIH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiA4LCBuZXV0cm9uQ291bnQ6IDgsIGVsZWN0cm9uQ291bnQ6IDggfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDgsIG5ldXRyb25Db3VudDogOCwgZWxlY3Ryb25Db3VudDogMTAgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDgsIG5ldXRyb25Db3VudDogOSwgZWxlY3Ryb25Db3VudDogOCB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogOCwgbmV1dHJvbkNvdW50OiA5LCBlbGVjdHJvbkNvdW50OiAxMCB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogOCwgbmV1dHJvbkNvdW50OiAxMCwgZWxlY3Ryb25Db3VudDogOCB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogOCwgbmV1dHJvbkNvdW50OiAxMCwgZWxlY3Ryb25Db3VudDogMTAgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDksIG5ldXRyb25Db3VudDogMTAsIGVsZWN0cm9uQ291bnQ6IDkgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDksIG5ldXRyb25Db3VudDogMTAsIGVsZWN0cm9uQ291bnQ6IDEwIH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiAxMCwgbmV1dHJvbkNvdW50OiAxMCwgZWxlY3Ryb25Db3VudDogMTAgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDEwLCBuZXV0cm9uQ291bnQ6IDExLCBlbGVjdHJvbkNvdW50OiAxMCB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogMTAsIG5ldXRyb25Db3VudDogMTIsIGVsZWN0cm9uQ291bnQ6IDEwIH0gKVxyXG4gIF0sXHJcbiAgW1xyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDEsIG5ldXRyb25Db3VudDogMCwgZWxlY3Ryb25Db3VudDogMCB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogMSwgbmV1dHJvbkNvdW50OiAwLCBlbGVjdHJvbkNvdW50OiAxIH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiAxLCBuZXV0cm9uQ291bnQ6IDAsIGVsZWN0cm9uQ291bnQ6IDIgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDEsIG5ldXRyb25Db3VudDogMSwgZWxlY3Ryb25Db3VudDogMCB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogMSwgbmV1dHJvbkNvdW50OiAxLCBlbGVjdHJvbkNvdW50OiAxIH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiAxLCBuZXV0cm9uQ291bnQ6IDEsIGVsZWN0cm9uQ291bnQ6IDIgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDIsIG5ldXRyb25Db3VudDogMSwgZWxlY3Ryb25Db3VudDogMiB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogMiwgbmV1dHJvbkNvdW50OiAyLCBlbGVjdHJvbkNvdW50OiAyIH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiAzLCBuZXV0cm9uQ291bnQ6IDMsIGVsZWN0cm9uQ291bnQ6IDIgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDMsIG5ldXRyb25Db3VudDogMywgZWxlY3Ryb25Db3VudDogMyB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogMywgbmV1dHJvbkNvdW50OiA0LCBlbGVjdHJvbkNvdW50OiAyIH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiAzLCBuZXV0cm9uQ291bnQ6IDQsIGVsZWN0cm9uQ291bnQ6IDMgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDQsIG5ldXRyb25Db3VudDogNSwgZWxlY3Ryb25Db3VudDogNCB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogNSwgbmV1dHJvbkNvdW50OiA1LCBlbGVjdHJvbkNvdW50OiA1IH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiA1LCBuZXV0cm9uQ291bnQ6IDYsIGVsZWN0cm9uQ291bnQ6IDUgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDYsIG5ldXRyb25Db3VudDogNiwgZWxlY3Ryb25Db3VudDogNiB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogNiwgbmV1dHJvbkNvdW50OiA3LCBlbGVjdHJvbkNvdW50OiA2IH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiA3LCBuZXV0cm9uQ291bnQ6IDcsIGVsZWN0cm9uQ291bnQ6IDcgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDcsIG5ldXRyb25Db3VudDogNywgZWxlY3Ryb25Db3VudDogMTAgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDcsIG5ldXRyb25Db3VudDogOCwgZWxlY3Ryb25Db3VudDogNyB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogNywgbmV1dHJvbkNvdW50OiA4LCBlbGVjdHJvbkNvdW50OiAxMCB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogOCwgbmV1dHJvbkNvdW50OiA4LCBlbGVjdHJvbkNvdW50OiA4IH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiA4LCBuZXV0cm9uQ291bnQ6IDgsIGVsZWN0cm9uQ291bnQ6IDEwIH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiA4LCBuZXV0cm9uQ291bnQ6IDksIGVsZWN0cm9uQ291bnQ6IDggfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDgsIG5ldXRyb25Db3VudDogOSwgZWxlY3Ryb25Db3VudDogMTAgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDgsIG5ldXRyb25Db3VudDogMTAsIGVsZWN0cm9uQ291bnQ6IDggfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDgsIG5ldXRyb25Db3VudDogMTAsIGVsZWN0cm9uQ291bnQ6IDEwIH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiA5LCBuZXV0cm9uQ291bnQ6IDEwLCBlbGVjdHJvbkNvdW50OiA5IH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiA5LCBuZXV0cm9uQ291bnQ6IDEwLCBlbGVjdHJvbkNvdW50OiAxMCB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogMTAsIG5ldXRyb25Db3VudDogMTAsIGVsZWN0cm9uQ291bnQ6IDEwIH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiAxMCwgbmV1dHJvbkNvdW50OiAxMSwgZWxlY3Ryb25Db3VudDogMTAgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDEwLCBuZXV0cm9uQ291bnQ6IDEyLCBlbGVjdHJvbkNvdW50OiAxMCB9IClcclxuICBdLFxyXG4gIFtcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiAxLCBuZXV0cm9uQ291bnQ6IDAsIGVsZWN0cm9uQ291bnQ6IDAgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDEsIG5ldXRyb25Db3VudDogMCwgZWxlY3Ryb25Db3VudDogMSB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogMSwgbmV1dHJvbkNvdW50OiAwLCBlbGVjdHJvbkNvdW50OiAyIH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiAxLCBuZXV0cm9uQ291bnQ6IDEsIGVsZWN0cm9uQ291bnQ6IDAgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDEsIG5ldXRyb25Db3VudDogMSwgZWxlY3Ryb25Db3VudDogMSB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogMSwgbmV1dHJvbkNvdW50OiAxLCBlbGVjdHJvbkNvdW50OiAyIH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiAyLCBuZXV0cm9uQ291bnQ6IDEsIGVsZWN0cm9uQ291bnQ6IDIgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDIsIG5ldXRyb25Db3VudDogMiwgZWxlY3Ryb25Db3VudDogMiB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogMywgbmV1dHJvbkNvdW50OiAzLCBlbGVjdHJvbkNvdW50OiAyIH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiAzLCBuZXV0cm9uQ291bnQ6IDMsIGVsZWN0cm9uQ291bnQ6IDMgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDMsIG5ldXRyb25Db3VudDogNCwgZWxlY3Ryb25Db3VudDogMiB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogMywgbmV1dHJvbkNvdW50OiA0LCBlbGVjdHJvbkNvdW50OiAzIH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiA0LCBuZXV0cm9uQ291bnQ6IDUsIGVsZWN0cm9uQ291bnQ6IDQgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDUsIG5ldXRyb25Db3VudDogNSwgZWxlY3Ryb25Db3VudDogNSB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogNSwgbmV1dHJvbkNvdW50OiA2LCBlbGVjdHJvbkNvdW50OiA1IH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiA2LCBuZXV0cm9uQ291bnQ6IDYsIGVsZWN0cm9uQ291bnQ6IDYgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDYsIG5ldXRyb25Db3VudDogNywgZWxlY3Ryb25Db3VudDogNiB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogNywgbmV1dHJvbkNvdW50OiA3LCBlbGVjdHJvbkNvdW50OiA3IH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiA3LCBuZXV0cm9uQ291bnQ6IDcsIGVsZWN0cm9uQ291bnQ6IDEwIH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiA3LCBuZXV0cm9uQ291bnQ6IDgsIGVsZWN0cm9uQ291bnQ6IDcgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDcsIG5ldXRyb25Db3VudDogOCwgZWxlY3Ryb25Db3VudDogMTAgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDgsIG5ldXRyb25Db3VudDogOCwgZWxlY3Ryb25Db3VudDogOCB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogOCwgbmV1dHJvbkNvdW50OiA4LCBlbGVjdHJvbkNvdW50OiAxMCB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogOCwgbmV1dHJvbkNvdW50OiA5LCBlbGVjdHJvbkNvdW50OiA4IH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiA4LCBuZXV0cm9uQ291bnQ6IDksIGVsZWN0cm9uQ291bnQ6IDEwIH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiA4LCBuZXV0cm9uQ291bnQ6IDEwLCBlbGVjdHJvbkNvdW50OiA4IH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiA4LCBuZXV0cm9uQ291bnQ6IDEwLCBlbGVjdHJvbkNvdW50OiAxMCB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogOSwgbmV1dHJvbkNvdW50OiAxMCwgZWxlY3Ryb25Db3VudDogOSB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogOSwgbmV1dHJvbkNvdW50OiAxMCwgZWxlY3Ryb25Db3VudDogMTAgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDEwLCBuZXV0cm9uQ291bnQ6IDEwLCBlbGVjdHJvbkNvdW50OiAxMCB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogMTAsIG5ldXRyb25Db3VudDogMTEsIGVsZWN0cm9uQ291bnQ6IDEwIH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiAxMCwgbmV1dHJvbkNvdW50OiAxMiwgZWxlY3Ryb25Db3VudDogMTAgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDExLCBuZXV0cm9uQ291bnQ6IDEyLCBlbGVjdHJvbkNvdW50OiAxMCB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogMTEsIG5ldXRyb25Db3VudDogMTIsIGVsZWN0cm9uQ291bnQ6IDExIH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiAxMiwgbmV1dHJvbkNvdW50OiAxMiwgZWxlY3Ryb25Db3VudDogMTAgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDEyLCBuZXV0cm9uQ291bnQ6IDEyLCBlbGVjdHJvbkNvdW50OiAxMiB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogMTIsIG5ldXRyb25Db3VudDogMTMsIGVsZWN0cm9uQ291bnQ6IDEwIH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiAxMiwgbmV1dHJvbkNvdW50OiAxMywgZWxlY3Ryb25Db3VudDogMTIgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDEyLCBuZXV0cm9uQ291bnQ6IDE0LCBlbGVjdHJvbkNvdW50OiAxMCB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogMTIsIG5ldXRyb25Db3VudDogMTQsIGVsZWN0cm9uQ291bnQ6IDEyIH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiAxMywgbmV1dHJvbkNvdW50OiAxNCwgZWxlY3Ryb25Db3VudDogMTAgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDEzLCBuZXV0cm9uQ291bnQ6IDE0LCBlbGVjdHJvbkNvdW50OiAxMyB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogMTQsIG5ldXRyb25Db3VudDogMTQsIGVsZWN0cm9uQ291bnQ6IDE0IH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiAxNCwgbmV1dHJvbkNvdW50OiAxNSwgZWxlY3Ryb25Db3VudDogMTQgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDE0LCBuZXV0cm9uQ291bnQ6IDE2LCBlbGVjdHJvbkNvdW50OiAxNCB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogMTUsIG5ldXRyb25Db3VudDogMTYsIGVsZWN0cm9uQ291bnQ6IDE1IH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiAxNiwgbmV1dHJvbkNvdW50OiAxNiwgZWxlY3Ryb25Db3VudDogMTYgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDE2LCBuZXV0cm9uQ291bnQ6IDE2LCBlbGVjdHJvbkNvdW50OiAxOCB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogMTYsIG5ldXRyb25Db3VudDogMTcsIGVsZWN0cm9uQ291bnQ6IDE2IH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiAxNiwgbmV1dHJvbkNvdW50OiAxNywgZWxlY3Ryb25Db3VudDogMTggfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDE2LCBuZXV0cm9uQ291bnQ6IDE4LCBlbGVjdHJvbkNvdW50OiAxNiB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogMTYsIG5ldXRyb25Db3VudDogMTgsIGVsZWN0cm9uQ291bnQ6IDE4IH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiAxNiwgbmV1dHJvbkNvdW50OiAxOSwgZWxlY3Ryb25Db3VudDogMTYgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDE2LCBuZXV0cm9uQ291bnQ6IDE5LCBlbGVjdHJvbkNvdW50OiAxOCB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogMTcsIG5ldXRyb25Db3VudDogMTgsIGVsZWN0cm9uQ291bnQ6IDE3IH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiAxNywgbmV1dHJvbkNvdW50OiAxOCwgZWxlY3Ryb25Db3VudDogMTggfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDE3LCBuZXV0cm9uQ291bnQ6IDIwLCBlbGVjdHJvbkNvdW50OiAxNyB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogMTcsIG5ldXRyb25Db3VudDogMjAsIGVsZWN0cm9uQ291bnQ6IDE4IH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiAxOCwgbmV1dHJvbkNvdW50OiAyMCwgZWxlY3Ryb25Db3VudDogMTggfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDE4LCBuZXV0cm9uQ291bnQ6IDIyLCBlbGVjdHJvbkNvdW50OiAxOCB9IClcclxuICBdLFxyXG4gIFtcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiAxLCBuZXV0cm9uQ291bnQ6IDAsIGVsZWN0cm9uQ291bnQ6IDAgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDEsIG5ldXRyb25Db3VudDogMCwgZWxlY3Ryb25Db3VudDogMSB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogMSwgbmV1dHJvbkNvdW50OiAwLCBlbGVjdHJvbkNvdW50OiAyIH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiAxLCBuZXV0cm9uQ291bnQ6IDEsIGVsZWN0cm9uQ291bnQ6IDAgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDEsIG5ldXRyb25Db3VudDogMSwgZWxlY3Ryb25Db3VudDogMSB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogMSwgbmV1dHJvbkNvdW50OiAxLCBlbGVjdHJvbkNvdW50OiAyIH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiAyLCBuZXV0cm9uQ291bnQ6IDEsIGVsZWN0cm9uQ291bnQ6IDIgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDIsIG5ldXRyb25Db3VudDogMiwgZWxlY3Ryb25Db3VudDogMiB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogMywgbmV1dHJvbkNvdW50OiAzLCBlbGVjdHJvbkNvdW50OiAyIH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiAzLCBuZXV0cm9uQ291bnQ6IDMsIGVsZWN0cm9uQ291bnQ6IDMgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDMsIG5ldXRyb25Db3VudDogNCwgZWxlY3Ryb25Db3VudDogMiB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogMywgbmV1dHJvbkNvdW50OiA0LCBlbGVjdHJvbkNvdW50OiAzIH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiA0LCBuZXV0cm9uQ291bnQ6IDUsIGVsZWN0cm9uQ291bnQ6IDQgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDUsIG5ldXRyb25Db3VudDogNSwgZWxlY3Ryb25Db3VudDogNSB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogNSwgbmV1dHJvbkNvdW50OiA2LCBlbGVjdHJvbkNvdW50OiA1IH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiA2LCBuZXV0cm9uQ291bnQ6IDYsIGVsZWN0cm9uQ291bnQ6IDYgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDYsIG5ldXRyb25Db3VudDogNywgZWxlY3Ryb25Db3VudDogNiB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogNywgbmV1dHJvbkNvdW50OiA3LCBlbGVjdHJvbkNvdW50OiA3IH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiA3LCBuZXV0cm9uQ291bnQ6IDcsIGVsZWN0cm9uQ291bnQ6IDEwIH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiA3LCBuZXV0cm9uQ291bnQ6IDgsIGVsZWN0cm9uQ291bnQ6IDcgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDcsIG5ldXRyb25Db3VudDogOCwgZWxlY3Ryb25Db3VudDogMTAgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDgsIG5ldXRyb25Db3VudDogOCwgZWxlY3Ryb25Db3VudDogOCB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogOCwgbmV1dHJvbkNvdW50OiA4LCBlbGVjdHJvbkNvdW50OiAxMCB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogOCwgbmV1dHJvbkNvdW50OiA5LCBlbGVjdHJvbkNvdW50OiA4IH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiA4LCBuZXV0cm9uQ291bnQ6IDksIGVsZWN0cm9uQ291bnQ6IDEwIH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiA4LCBuZXV0cm9uQ291bnQ6IDEwLCBlbGVjdHJvbkNvdW50OiA4IH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiA4LCBuZXV0cm9uQ291bnQ6IDEwLCBlbGVjdHJvbkNvdW50OiAxMCB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogOSwgbmV1dHJvbkNvdW50OiAxMCwgZWxlY3Ryb25Db3VudDogOSB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogOSwgbmV1dHJvbkNvdW50OiAxMCwgZWxlY3Ryb25Db3VudDogMTAgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDEwLCBuZXV0cm9uQ291bnQ6IDEwLCBlbGVjdHJvbkNvdW50OiAxMCB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogMTAsIG5ldXRyb25Db3VudDogMTEsIGVsZWN0cm9uQ291bnQ6IDEwIH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiAxMCwgbmV1dHJvbkNvdW50OiAxMiwgZWxlY3Ryb25Db3VudDogMTAgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDExLCBuZXV0cm9uQ291bnQ6IDEyLCBlbGVjdHJvbkNvdW50OiAxMCB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogMTEsIG5ldXRyb25Db3VudDogMTIsIGVsZWN0cm9uQ291bnQ6IDExIH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiAxMiwgbmV1dHJvbkNvdW50OiAxMiwgZWxlY3Ryb25Db3VudDogMTAgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDEyLCBuZXV0cm9uQ291bnQ6IDEyLCBlbGVjdHJvbkNvdW50OiAxMiB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogMTIsIG5ldXRyb25Db3VudDogMTMsIGVsZWN0cm9uQ291bnQ6IDEwIH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiAxMiwgbmV1dHJvbkNvdW50OiAxMywgZWxlY3Ryb25Db3VudDogMTIgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDEyLCBuZXV0cm9uQ291bnQ6IDE0LCBlbGVjdHJvbkNvdW50OiAxMCB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogMTIsIG5ldXRyb25Db3VudDogMTQsIGVsZWN0cm9uQ291bnQ6IDEyIH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiAxMywgbmV1dHJvbkNvdW50OiAxNCwgZWxlY3Ryb25Db3VudDogMTAgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDEzLCBuZXV0cm9uQ291bnQ6IDE0LCBlbGVjdHJvbkNvdW50OiAxMyB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogMTQsIG5ldXRyb25Db3VudDogMTQsIGVsZWN0cm9uQ291bnQ6IDE0IH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiAxNCwgbmV1dHJvbkNvdW50OiAxNSwgZWxlY3Ryb25Db3VudDogMTQgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDE0LCBuZXV0cm9uQ291bnQ6IDE2LCBlbGVjdHJvbkNvdW50OiAxNCB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogMTUsIG5ldXRyb25Db3VudDogMTYsIGVsZWN0cm9uQ291bnQ6IDE1IH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiAxNiwgbmV1dHJvbkNvdW50OiAxNiwgZWxlY3Ryb25Db3VudDogMTYgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDE2LCBuZXV0cm9uQ291bnQ6IDE2LCBlbGVjdHJvbkNvdW50OiAxOCB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogMTYsIG5ldXRyb25Db3VudDogMTcsIGVsZWN0cm9uQ291bnQ6IDE2IH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiAxNiwgbmV1dHJvbkNvdW50OiAxNywgZWxlY3Ryb25Db3VudDogMTggfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDE2LCBuZXV0cm9uQ291bnQ6IDE4LCBlbGVjdHJvbkNvdW50OiAxNiB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogMTYsIG5ldXRyb25Db3VudDogMTgsIGVsZWN0cm9uQ291bnQ6IDE4IH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiAxNiwgbmV1dHJvbkNvdW50OiAxOSwgZWxlY3Ryb25Db3VudDogMTYgfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDE2LCBuZXV0cm9uQ291bnQ6IDE5LCBlbGVjdHJvbkNvdW50OiAxOCB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogMTcsIG5ldXRyb25Db3VudDogMTgsIGVsZWN0cm9uQ291bnQ6IDE3IH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiAxNywgbmV1dHJvbkNvdW50OiAxOCwgZWxlY3Ryb25Db3VudDogMTggfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDE3LCBuZXV0cm9uQ291bnQ6IDIwLCBlbGVjdHJvbkNvdW50OiAxNyB9ICksXHJcbiAgICBuZXcgTnVtYmVyQXRvbSggeyBwcm90b25Db3VudDogMTcsIG5ldXRyb25Db3VudDogMjAsIGVsZWN0cm9uQ291bnQ6IDE4IH0gKSxcclxuICAgIG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiAxOCwgbmV1dHJvbkNvdW50OiAyMCwgZWxlY3Ryb25Db3VudDogMTggfSApLFxyXG4gICAgbmV3IE51bWJlckF0b20oIHsgcHJvdG9uQ291bnQ6IDE4LCBuZXV0cm9uQ291bnQ6IDIyLCBlbGVjdHJvbkNvdW50OiAxOCB9IClcclxuICBdXHJcbl07XHJcblxyXG4vKipcclxuICogQHBhcmFtIHtudW1iZXJ9IGxldmVsXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKi9cclxuZnVuY3Rpb24gQXRvbVZhbHVlUG9vbCggbGV2ZWwgKSB7XHJcbiAgdGhpcy5yZW1haW5pbmdBdG9tVmFsdWVzID0gQ0hBTExFTkdFX1BPT0xTWyBsZXZlbCBdO1xyXG4gIHRoaXMudXNlZEF0b21WYWx1ZXMgPSBbXTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJlbW92ZSB0aGUgc3BlY2lmaWVkIGF0b20gdmFsdWUgZnJvbSB0aGUgbGlzdCBvZiB0aG9zZSBhdmFpbGFibGUuXHJcbiAqXHJcbiAqIEBwYXJhbSBhdG9tVmFsdWVUb1JlbW92ZVxyXG4gKi9cclxuQXRvbVZhbHVlUG9vbC5wcm90b3R5cGUubWFya0F0b21Bc1VzZWQgPSBmdW5jdGlvbiggYXRvbVZhbHVlVG9SZW1vdmUgKSB7XHJcbiAgaWYgKCB0aGlzLnJlbWFpbmluZ0F0b21WYWx1ZXMuaW5kZXhPZiggYXRvbVZhbHVlVG9SZW1vdmUgKSAhPT0gLTEgKSB7XHJcbiAgICB0aGlzLnJlbWFpbmluZ0F0b21WYWx1ZXMgPSBfLndpdGhvdXQoIHRoaXMucmVtYWluaW5nQXRvbVZhbHVlcywgYXRvbVZhbHVlVG9SZW1vdmUgKTtcclxuICAgIHRoaXMudXNlZEF0b21WYWx1ZXMucHVzaCggYXRvbVZhbHVlVG9SZW1vdmUgKTtcclxuICB9XHJcbn07XHJcblxyXG4vKipcclxuICogR2V0IGEgcmFuZG9tIGF0b20gdmFsdWUgZnJvbSB0aGUgcG9vbCB0aGF0IG1hdGNoZXMgdGhlIHNwZWNpZmllZCBjcml0ZXJpYS5cclxuICpcclxuICogQHBhcmFtIG1pblByb3RvbkNvdW50XHJcbiAqIEBwYXJhbSBtYXhQcm90b25Db3VudFxyXG4gKiBAcGFyYW0gcmVxdWlyZUNoYXJnZWRcclxuICogQHJldHVybnMgYW4gYXRvbSB0aGF0IG1hdGNoZXMsIG9yIG51bGwgaWYgbm9uZSBleGlzdCBpbiB0aGUgcG9vbFxyXG4gKiBAcHVibGljXHJcbiAqL1xyXG5BdG9tVmFsdWVQb29sLnByb3RvdHlwZS5nZXRSYW5kb21BdG9tVmFsdWUgPSBmdW5jdGlvbiggbWluUHJvdG9uQ291bnQsIG1heFByb3RvbkNvdW50LCByZXF1aXJlQ2hhcmdlZCApIHtcclxuXHJcbiAgLy8gRGVmaW5lIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRydWUgaWYgYSBnaXZlbiBhdG9tIG1hdGNoZXMgdGhlIGNyaXRlcmlhLlxyXG4gIGNvbnN0IG1lZXRzQ3JpdGVyaWEgPSBudW1iZXJBdG9tID0+IG51bWJlckF0b20ucHJvdG9uQ291bnRQcm9wZXJ0eS5nZXQoKSA+PSBtaW5Qcm90b25Db3VudCAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bWJlckF0b20ucHJvdG9uQ291bnRQcm9wZXJ0eS5nZXQoKSA8IG1heFByb3RvbkNvdW50ICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCAhcmVxdWlyZUNoYXJnZWQgfHwgbnVtYmVyQXRvbS5jaGFyZ2VQcm9wZXJ0eS5nZXQoKSAhPT0gMCApO1xyXG5cclxuICAvLyBNYWtlIGEgbGlzdCBvZiB0aGUgYXRvbXMgdGhhdCBtZWV0IHRoZSBjcml0ZXJpYS5cclxuICBjb25zdCBhbGxvd2FibGVBdG9tVmFsdWVzID0gW107XHJcbiAgdGhpcy5yZW1haW5pbmdBdG9tVmFsdWVzLmZvckVhY2goIG51bWJlckF0b20gPT4ge1xyXG4gICAgaWYgKCBtZWV0c0NyaXRlcmlhKCBudW1iZXJBdG9tICkgKSB7XHJcbiAgICAgIGFsbG93YWJsZUF0b21WYWx1ZXMucHVzaCggbnVtYmVyQXRvbSApO1xyXG4gICAgfVxyXG4gIH0gKTtcclxuXHJcbiAgaWYgKCBhbGxvd2FibGVBdG9tVmFsdWVzLmxlbmd0aCA9PT0gMCApIHtcclxuICAgIC8vIFRoZXJlIHdlcmUgbm9uZSBhdmFpbGFibGUgb24gdGhlIGxpc3Qgb2YgdW51c2VkIGF0b21zLCBzb1xyXG4gICAgLy8gYWRkIHRoZW0gZnJvbSB0aGUgbGlzdCBvZiB1c2VkIGF0b21zIGluc3RlYWQuXHJcbiAgICB0aGlzLnVzZWRBdG9tVmFsdWVzLmZvckVhY2goIG51bWJlckF0b20gPT4ge1xyXG4gICAgICBpZiAoIG1lZXRzQ3JpdGVyaWEoIG51bWJlckF0b20gKSApIHtcclxuICAgICAgICBhbGxvd2FibGVBdG9tVmFsdWVzLnB1c2goIG51bWJlckF0b20gKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLy8gQ2hvb3NlIGEgcmFuZG9tIHZhbHVlIGZyb20gdGhlIGxpc3QuXHJcbiAgbGV0IGF0b21WYWx1ZSA9IG51bGw7XHJcbiAgaWYgKCBhbGxvd2FibGVBdG9tVmFsdWVzLmxlbmd0aCA+IDAgKSB7XHJcbiAgICBhdG9tVmFsdWUgPSBhbGxvd2FibGVBdG9tVmFsdWVzWyBNYXRoLmZsb29yKCBkb3RSYW5kb20ubmV4dERvdWJsZSgpICogYWxsb3dhYmxlQXRvbVZhbHVlcy5sZW5ndGggKSBdO1xyXG4gIH1cclxuICBlbHNlIHtcclxuICAgIHRocm93IG5ldyBFcnJvciggJ0Vycm9yOiBObyBhdG9tcyBmb3VuZCB0aGF0IG1hdGNoIHRoZSBzcGVjaWZpZWQgY3JpdGVyaWEnICk7XHJcbiAgfVxyXG4gIHJldHVybiBhdG9tVmFsdWU7XHJcbn07XHJcblxyXG5idWlsZEFuQXRvbS5yZWdpc3RlciggJ0F0b21WYWx1ZVBvb2wnLCBBdG9tVmFsdWVQb29sICk7XHJcbmV4cG9ydCBkZWZhdWx0IEF0b21WYWx1ZVBvb2w7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsU0FBUyxNQUFNLGlDQUFpQztBQUN2RCxPQUFPQyxVQUFVLE1BQU0sMENBQTBDO0FBQ2pFLE9BQU9DLFdBQVcsTUFBTSxzQkFBc0I7O0FBRTlDO0FBQ0E7QUFDQTtBQUNBLE1BQU1DLGVBQWUsR0FBRyxDQUN0QixDQUNFLElBQUlGLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsQ0FBQztFQUFFQyxZQUFZLEVBQUUsQ0FBQztFQUFFQyxhQUFhLEVBQUU7QUFBRSxDQUFFLENBQUMsRUFDdkUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxDQUFDO0VBQUVDLFlBQVksRUFBRSxDQUFDO0VBQUVDLGFBQWEsRUFBRTtBQUFFLENBQUUsQ0FBQyxFQUN2RSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLENBQUM7RUFBRUMsWUFBWSxFQUFFLENBQUM7RUFBRUMsYUFBYSxFQUFFO0FBQUUsQ0FBRSxDQUFDLEVBQ3ZFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsQ0FBQztFQUFFQyxZQUFZLEVBQUUsQ0FBQztFQUFFQyxhQUFhLEVBQUU7QUFBRSxDQUFFLENBQUMsRUFDdkUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxDQUFDO0VBQUVDLFlBQVksRUFBRSxDQUFDO0VBQUVDLGFBQWEsRUFBRTtBQUFFLENBQUUsQ0FBQyxFQUN2RSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLENBQUM7RUFBRUMsWUFBWSxFQUFFLENBQUM7RUFBRUMsYUFBYSxFQUFFO0FBQUUsQ0FBRSxDQUFDLEVBQ3ZFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsQ0FBQztFQUFFQyxZQUFZLEVBQUUsQ0FBQztFQUFFQyxhQUFhLEVBQUU7QUFBRSxDQUFFLENBQUMsRUFDdkUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxDQUFDO0VBQUVDLFlBQVksRUFBRSxDQUFDO0VBQUVDLGFBQWEsRUFBRTtBQUFFLENBQUUsQ0FBQyxFQUN2RSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLENBQUM7RUFBRUMsWUFBWSxFQUFFLENBQUM7RUFBRUMsYUFBYSxFQUFFO0FBQUUsQ0FBRSxDQUFDLEVBQ3ZFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsQ0FBQztFQUFFQyxZQUFZLEVBQUUsQ0FBQztFQUFFQyxhQUFhLEVBQUU7QUFBRSxDQUFFLENBQUMsRUFDdkUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxDQUFDO0VBQUVDLFlBQVksRUFBRSxDQUFDO0VBQUVDLGFBQWEsRUFBRTtBQUFFLENBQUUsQ0FBQyxFQUN2RSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLENBQUM7RUFBRUMsWUFBWSxFQUFFLENBQUM7RUFBRUMsYUFBYSxFQUFFO0FBQUUsQ0FBRSxDQUFDLEVBQ3ZFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsQ0FBQztFQUFFQyxZQUFZLEVBQUUsQ0FBQztFQUFFQyxhQUFhLEVBQUU7QUFBRSxDQUFFLENBQUMsRUFDdkUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxDQUFDO0VBQUVDLFlBQVksRUFBRSxDQUFDO0VBQUVDLGFBQWEsRUFBRTtBQUFFLENBQUUsQ0FBQyxFQUN2RSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLENBQUM7RUFBRUMsWUFBWSxFQUFFLENBQUM7RUFBRUMsYUFBYSxFQUFFO0FBQUUsQ0FBRSxDQUFDLEVBQ3ZFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsQ0FBQztFQUFFQyxZQUFZLEVBQUUsQ0FBQztFQUFFQyxhQUFhLEVBQUU7QUFBRSxDQUFFLENBQUMsRUFDdkUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxDQUFDO0VBQUVDLFlBQVksRUFBRSxDQUFDO0VBQUVDLGFBQWEsRUFBRTtBQUFFLENBQUUsQ0FBQyxFQUN2RSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLENBQUM7RUFBRUMsWUFBWSxFQUFFLENBQUM7RUFBRUMsYUFBYSxFQUFFO0FBQUUsQ0FBRSxDQUFDLEVBQ3ZFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsQ0FBQztFQUFFQyxZQUFZLEVBQUUsQ0FBQztFQUFFQyxhQUFhLEVBQUU7QUFBRyxDQUFFLENBQUMsRUFDeEUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxDQUFDO0VBQUVDLFlBQVksRUFBRSxDQUFDO0VBQUVDLGFBQWEsRUFBRTtBQUFFLENBQUUsQ0FBQyxFQUN2RSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLENBQUM7RUFBRUMsWUFBWSxFQUFFLENBQUM7RUFBRUMsYUFBYSxFQUFFO0FBQUcsQ0FBRSxDQUFDLEVBQ3hFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsQ0FBQztFQUFFQyxZQUFZLEVBQUUsQ0FBQztFQUFFQyxhQUFhLEVBQUU7QUFBRSxDQUFFLENBQUMsRUFDdkUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxDQUFDO0VBQUVDLFlBQVksRUFBRSxDQUFDO0VBQUVDLGFBQWEsRUFBRTtBQUFHLENBQUUsQ0FBQyxFQUN4RSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLENBQUM7RUFBRUMsWUFBWSxFQUFFLENBQUM7RUFBRUMsYUFBYSxFQUFFO0FBQUUsQ0FBRSxDQUFDLEVBQ3ZFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsQ0FBQztFQUFFQyxZQUFZLEVBQUUsQ0FBQztFQUFFQyxhQUFhLEVBQUU7QUFBRyxDQUFFLENBQUMsRUFDeEUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxDQUFDO0VBQUVDLFlBQVksRUFBRSxFQUFFO0VBQUVDLGFBQWEsRUFBRTtBQUFFLENBQUUsQ0FBQyxFQUN4RSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLENBQUM7RUFBRUMsWUFBWSxFQUFFLEVBQUU7RUFBRUMsYUFBYSxFQUFFO0FBQUcsQ0FBRSxDQUFDLEVBQ3pFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsQ0FBQztFQUFFQyxZQUFZLEVBQUUsRUFBRTtFQUFFQyxhQUFhLEVBQUU7QUFBRSxDQUFFLENBQUMsRUFDeEUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxDQUFDO0VBQUVDLFlBQVksRUFBRSxFQUFFO0VBQUVDLGFBQWEsRUFBRTtBQUFHLENBQUUsQ0FBQyxFQUN6RSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLEVBQUU7RUFBRUMsWUFBWSxFQUFFLEVBQUU7RUFBRUMsYUFBYSxFQUFFO0FBQUcsQ0FBRSxDQUFDLEVBQzFFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsRUFBRTtFQUFFQyxZQUFZLEVBQUUsRUFBRTtFQUFFQyxhQUFhLEVBQUU7QUFBRyxDQUFFLENBQUMsRUFDMUUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxFQUFFO0VBQUVDLFlBQVksRUFBRSxFQUFFO0VBQUVDLGFBQWEsRUFBRTtBQUFHLENBQUUsQ0FBQyxDQUMzRSxFQUNELENBQ0UsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxDQUFDO0VBQUVDLFlBQVksRUFBRSxDQUFDO0VBQUVDLGFBQWEsRUFBRTtBQUFFLENBQUUsQ0FBQyxFQUN2RSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLENBQUM7RUFBRUMsWUFBWSxFQUFFLENBQUM7RUFBRUMsYUFBYSxFQUFFO0FBQUUsQ0FBRSxDQUFDLEVBQ3ZFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsQ0FBQztFQUFFQyxZQUFZLEVBQUUsQ0FBQztFQUFFQyxhQUFhLEVBQUU7QUFBRSxDQUFFLENBQUMsRUFDdkUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxDQUFDO0VBQUVDLFlBQVksRUFBRSxDQUFDO0VBQUVDLGFBQWEsRUFBRTtBQUFFLENBQUUsQ0FBQyxFQUN2RSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLENBQUM7RUFBRUMsWUFBWSxFQUFFLENBQUM7RUFBRUMsYUFBYSxFQUFFO0FBQUUsQ0FBRSxDQUFDLEVBQ3ZFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsQ0FBQztFQUFFQyxZQUFZLEVBQUUsQ0FBQztFQUFFQyxhQUFhLEVBQUU7QUFBRSxDQUFFLENBQUMsRUFDdkUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxDQUFDO0VBQUVDLFlBQVksRUFBRSxDQUFDO0VBQUVDLGFBQWEsRUFBRTtBQUFFLENBQUUsQ0FBQyxFQUN2RSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLENBQUM7RUFBRUMsWUFBWSxFQUFFLENBQUM7RUFBRUMsYUFBYSxFQUFFO0FBQUUsQ0FBRSxDQUFDLEVBQ3ZFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsQ0FBQztFQUFFQyxZQUFZLEVBQUUsQ0FBQztFQUFFQyxhQUFhLEVBQUU7QUFBRSxDQUFFLENBQUMsRUFDdkUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxDQUFDO0VBQUVDLFlBQVksRUFBRSxDQUFDO0VBQUVDLGFBQWEsRUFBRTtBQUFFLENBQUUsQ0FBQyxFQUN2RSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLENBQUM7RUFBRUMsWUFBWSxFQUFFLENBQUM7RUFBRUMsYUFBYSxFQUFFO0FBQUUsQ0FBRSxDQUFDLEVBQ3ZFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsQ0FBQztFQUFFQyxZQUFZLEVBQUUsQ0FBQztFQUFFQyxhQUFhLEVBQUU7QUFBRSxDQUFFLENBQUMsRUFDdkUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxDQUFDO0VBQUVDLFlBQVksRUFBRSxDQUFDO0VBQUVDLGFBQWEsRUFBRTtBQUFFLENBQUUsQ0FBQyxFQUN2RSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLENBQUM7RUFBRUMsWUFBWSxFQUFFLENBQUM7RUFBRUMsYUFBYSxFQUFFO0FBQUUsQ0FBRSxDQUFDLEVBQ3ZFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsQ0FBQztFQUFFQyxZQUFZLEVBQUUsQ0FBQztFQUFFQyxhQUFhLEVBQUU7QUFBRSxDQUFFLENBQUMsRUFDdkUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxDQUFDO0VBQUVDLFlBQVksRUFBRSxDQUFDO0VBQUVDLGFBQWEsRUFBRTtBQUFFLENBQUUsQ0FBQyxFQUN2RSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLENBQUM7RUFBRUMsWUFBWSxFQUFFLENBQUM7RUFBRUMsYUFBYSxFQUFFO0FBQUUsQ0FBRSxDQUFDLEVBQ3ZFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsQ0FBQztFQUFFQyxZQUFZLEVBQUUsQ0FBQztFQUFFQyxhQUFhLEVBQUU7QUFBRSxDQUFFLENBQUMsRUFDdkUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxDQUFDO0VBQUVDLFlBQVksRUFBRSxDQUFDO0VBQUVDLGFBQWEsRUFBRTtBQUFHLENBQUUsQ0FBQyxFQUN4RSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLENBQUM7RUFBRUMsWUFBWSxFQUFFLENBQUM7RUFBRUMsYUFBYSxFQUFFO0FBQUUsQ0FBRSxDQUFDLEVBQ3ZFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsQ0FBQztFQUFFQyxZQUFZLEVBQUUsQ0FBQztFQUFFQyxhQUFhLEVBQUU7QUFBRyxDQUFFLENBQUMsRUFDeEUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxDQUFDO0VBQUVDLFlBQVksRUFBRSxDQUFDO0VBQUVDLGFBQWEsRUFBRTtBQUFFLENBQUUsQ0FBQyxFQUN2RSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLENBQUM7RUFBRUMsWUFBWSxFQUFFLENBQUM7RUFBRUMsYUFBYSxFQUFFO0FBQUcsQ0FBRSxDQUFDLEVBQ3hFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsQ0FBQztFQUFFQyxZQUFZLEVBQUUsQ0FBQztFQUFFQyxhQUFhLEVBQUU7QUFBRSxDQUFFLENBQUMsRUFDdkUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxDQUFDO0VBQUVDLFlBQVksRUFBRSxDQUFDO0VBQUVDLGFBQWEsRUFBRTtBQUFHLENBQUUsQ0FBQyxFQUN4RSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLENBQUM7RUFBRUMsWUFBWSxFQUFFLEVBQUU7RUFBRUMsYUFBYSxFQUFFO0FBQUUsQ0FBRSxDQUFDLEVBQ3hFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsQ0FBQztFQUFFQyxZQUFZLEVBQUUsRUFBRTtFQUFFQyxhQUFhLEVBQUU7QUFBRyxDQUFFLENBQUMsRUFDekUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxDQUFDO0VBQUVDLFlBQVksRUFBRSxFQUFFO0VBQUVDLGFBQWEsRUFBRTtBQUFFLENBQUUsQ0FBQyxFQUN4RSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLENBQUM7RUFBRUMsWUFBWSxFQUFFLEVBQUU7RUFBRUMsYUFBYSxFQUFFO0FBQUcsQ0FBRSxDQUFDLEVBQ3pFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsRUFBRTtFQUFFQyxZQUFZLEVBQUUsRUFBRTtFQUFFQyxhQUFhLEVBQUU7QUFBRyxDQUFFLENBQUMsRUFDMUUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxFQUFFO0VBQUVDLFlBQVksRUFBRSxFQUFFO0VBQUVDLGFBQWEsRUFBRTtBQUFHLENBQUUsQ0FBQyxFQUMxRSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLEVBQUU7RUFBRUMsWUFBWSxFQUFFLEVBQUU7RUFBRUMsYUFBYSxFQUFFO0FBQUcsQ0FBRSxDQUFDLENBQzNFLEVBQ0QsQ0FDRSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLENBQUM7RUFBRUMsWUFBWSxFQUFFLENBQUM7RUFBRUMsYUFBYSxFQUFFO0FBQUUsQ0FBRSxDQUFDLEVBQ3ZFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsQ0FBQztFQUFFQyxZQUFZLEVBQUUsQ0FBQztFQUFFQyxhQUFhLEVBQUU7QUFBRSxDQUFFLENBQUMsRUFDdkUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxDQUFDO0VBQUVDLFlBQVksRUFBRSxDQUFDO0VBQUVDLGFBQWEsRUFBRTtBQUFFLENBQUUsQ0FBQyxFQUN2RSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLENBQUM7RUFBRUMsWUFBWSxFQUFFLENBQUM7RUFBRUMsYUFBYSxFQUFFO0FBQUUsQ0FBRSxDQUFDLEVBQ3ZFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsQ0FBQztFQUFFQyxZQUFZLEVBQUUsQ0FBQztFQUFFQyxhQUFhLEVBQUU7QUFBRSxDQUFFLENBQUMsRUFDdkUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxDQUFDO0VBQUVDLFlBQVksRUFBRSxDQUFDO0VBQUVDLGFBQWEsRUFBRTtBQUFFLENBQUUsQ0FBQyxFQUN2RSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLENBQUM7RUFBRUMsWUFBWSxFQUFFLENBQUM7RUFBRUMsYUFBYSxFQUFFO0FBQUUsQ0FBRSxDQUFDLEVBQ3ZFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsQ0FBQztFQUFFQyxZQUFZLEVBQUUsQ0FBQztFQUFFQyxhQUFhLEVBQUU7QUFBRSxDQUFFLENBQUMsRUFDdkUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxDQUFDO0VBQUVDLFlBQVksRUFBRSxDQUFDO0VBQUVDLGFBQWEsRUFBRTtBQUFFLENBQUUsQ0FBQyxFQUN2RSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLENBQUM7RUFBRUMsWUFBWSxFQUFFLENBQUM7RUFBRUMsYUFBYSxFQUFFO0FBQUUsQ0FBRSxDQUFDLEVBQ3ZFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsQ0FBQztFQUFFQyxZQUFZLEVBQUUsQ0FBQztFQUFFQyxhQUFhLEVBQUU7QUFBRSxDQUFFLENBQUMsRUFDdkUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxDQUFDO0VBQUVDLFlBQVksRUFBRSxDQUFDO0VBQUVDLGFBQWEsRUFBRTtBQUFFLENBQUUsQ0FBQyxFQUN2RSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLENBQUM7RUFBRUMsWUFBWSxFQUFFLENBQUM7RUFBRUMsYUFBYSxFQUFFO0FBQUUsQ0FBRSxDQUFDLEVBQ3ZFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsQ0FBQztFQUFFQyxZQUFZLEVBQUUsQ0FBQztFQUFFQyxhQUFhLEVBQUU7QUFBRSxDQUFFLENBQUMsRUFDdkUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxDQUFDO0VBQUVDLFlBQVksRUFBRSxDQUFDO0VBQUVDLGFBQWEsRUFBRTtBQUFFLENBQUUsQ0FBQyxFQUN2RSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLENBQUM7RUFBRUMsWUFBWSxFQUFFLENBQUM7RUFBRUMsYUFBYSxFQUFFO0FBQUUsQ0FBRSxDQUFDLEVBQ3ZFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsQ0FBQztFQUFFQyxZQUFZLEVBQUUsQ0FBQztFQUFFQyxhQUFhLEVBQUU7QUFBRSxDQUFFLENBQUMsRUFDdkUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxDQUFDO0VBQUVDLFlBQVksRUFBRSxDQUFDO0VBQUVDLGFBQWEsRUFBRTtBQUFFLENBQUUsQ0FBQyxFQUN2RSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLENBQUM7RUFBRUMsWUFBWSxFQUFFLENBQUM7RUFBRUMsYUFBYSxFQUFFO0FBQUcsQ0FBRSxDQUFDLEVBQ3hFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsQ0FBQztFQUFFQyxZQUFZLEVBQUUsQ0FBQztFQUFFQyxhQUFhLEVBQUU7QUFBRSxDQUFFLENBQUMsRUFDdkUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxDQUFDO0VBQUVDLFlBQVksRUFBRSxDQUFDO0VBQUVDLGFBQWEsRUFBRTtBQUFHLENBQUUsQ0FBQyxFQUN4RSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLENBQUM7RUFBRUMsWUFBWSxFQUFFLENBQUM7RUFBRUMsYUFBYSxFQUFFO0FBQUUsQ0FBRSxDQUFDLEVBQ3ZFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsQ0FBQztFQUFFQyxZQUFZLEVBQUUsQ0FBQztFQUFFQyxhQUFhLEVBQUU7QUFBRyxDQUFFLENBQUMsRUFDeEUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxDQUFDO0VBQUVDLFlBQVksRUFBRSxDQUFDO0VBQUVDLGFBQWEsRUFBRTtBQUFFLENBQUUsQ0FBQyxFQUN2RSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLENBQUM7RUFBRUMsWUFBWSxFQUFFLENBQUM7RUFBRUMsYUFBYSxFQUFFO0FBQUcsQ0FBRSxDQUFDLEVBQ3hFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsQ0FBQztFQUFFQyxZQUFZLEVBQUUsRUFBRTtFQUFFQyxhQUFhLEVBQUU7QUFBRSxDQUFFLENBQUMsRUFDeEUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxDQUFDO0VBQUVDLFlBQVksRUFBRSxFQUFFO0VBQUVDLGFBQWEsRUFBRTtBQUFHLENBQUUsQ0FBQyxFQUN6RSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLENBQUM7RUFBRUMsWUFBWSxFQUFFLEVBQUU7RUFBRUMsYUFBYSxFQUFFO0FBQUUsQ0FBRSxDQUFDLEVBQ3hFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsQ0FBQztFQUFFQyxZQUFZLEVBQUUsRUFBRTtFQUFFQyxhQUFhLEVBQUU7QUFBRyxDQUFFLENBQUMsRUFDekUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxFQUFFO0VBQUVDLFlBQVksRUFBRSxFQUFFO0VBQUVDLGFBQWEsRUFBRTtBQUFHLENBQUUsQ0FBQyxFQUMxRSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLEVBQUU7RUFBRUMsWUFBWSxFQUFFLEVBQUU7RUFBRUMsYUFBYSxFQUFFO0FBQUcsQ0FBRSxDQUFDLEVBQzFFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsRUFBRTtFQUFFQyxZQUFZLEVBQUUsRUFBRTtFQUFFQyxhQUFhLEVBQUU7QUFBRyxDQUFFLENBQUMsRUFDMUUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxFQUFFO0VBQUVDLFlBQVksRUFBRSxFQUFFO0VBQUVDLGFBQWEsRUFBRTtBQUFHLENBQUUsQ0FBQyxFQUMxRSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLEVBQUU7RUFBRUMsWUFBWSxFQUFFLEVBQUU7RUFBRUMsYUFBYSxFQUFFO0FBQUcsQ0FBRSxDQUFDLEVBQzFFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsRUFBRTtFQUFFQyxZQUFZLEVBQUUsRUFBRTtFQUFFQyxhQUFhLEVBQUU7QUFBRyxDQUFFLENBQUMsRUFDMUUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxFQUFFO0VBQUVDLFlBQVksRUFBRSxFQUFFO0VBQUVDLGFBQWEsRUFBRTtBQUFHLENBQUUsQ0FBQyxFQUMxRSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLEVBQUU7RUFBRUMsWUFBWSxFQUFFLEVBQUU7RUFBRUMsYUFBYSxFQUFFO0FBQUcsQ0FBRSxDQUFDLEVBQzFFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsRUFBRTtFQUFFQyxZQUFZLEVBQUUsRUFBRTtFQUFFQyxhQUFhLEVBQUU7QUFBRyxDQUFFLENBQUMsRUFDMUUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxFQUFFO0VBQUVDLFlBQVksRUFBRSxFQUFFO0VBQUVDLGFBQWEsRUFBRTtBQUFHLENBQUUsQ0FBQyxFQUMxRSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLEVBQUU7RUFBRUMsWUFBWSxFQUFFLEVBQUU7RUFBRUMsYUFBYSxFQUFFO0FBQUcsQ0FBRSxDQUFDLEVBQzFFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsRUFBRTtFQUFFQyxZQUFZLEVBQUUsRUFBRTtFQUFFQyxhQUFhLEVBQUU7QUFBRyxDQUFFLENBQUMsRUFDMUUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxFQUFFO0VBQUVDLFlBQVksRUFBRSxFQUFFO0VBQUVDLGFBQWEsRUFBRTtBQUFHLENBQUUsQ0FBQyxFQUMxRSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLEVBQUU7RUFBRUMsWUFBWSxFQUFFLEVBQUU7RUFBRUMsYUFBYSxFQUFFO0FBQUcsQ0FBRSxDQUFDLEVBQzFFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsRUFBRTtFQUFFQyxZQUFZLEVBQUUsRUFBRTtFQUFFQyxhQUFhLEVBQUU7QUFBRyxDQUFFLENBQUMsRUFDMUUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxFQUFFO0VBQUVDLFlBQVksRUFBRSxFQUFFO0VBQUVDLGFBQWEsRUFBRTtBQUFHLENBQUUsQ0FBQyxFQUMxRSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLEVBQUU7RUFBRUMsWUFBWSxFQUFFLEVBQUU7RUFBRUMsYUFBYSxFQUFFO0FBQUcsQ0FBRSxDQUFDLEVBQzFFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsRUFBRTtFQUFFQyxZQUFZLEVBQUUsRUFBRTtFQUFFQyxhQUFhLEVBQUU7QUFBRyxDQUFFLENBQUMsRUFDMUUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxFQUFFO0VBQUVDLFlBQVksRUFBRSxFQUFFO0VBQUVDLGFBQWEsRUFBRTtBQUFHLENBQUUsQ0FBQyxFQUMxRSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLEVBQUU7RUFBRUMsWUFBWSxFQUFFLEVBQUU7RUFBRUMsYUFBYSxFQUFFO0FBQUcsQ0FBRSxDQUFDLEVBQzFFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsRUFBRTtFQUFFQyxZQUFZLEVBQUUsRUFBRTtFQUFFQyxhQUFhLEVBQUU7QUFBRyxDQUFFLENBQUMsRUFDMUUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxFQUFFO0VBQUVDLFlBQVksRUFBRSxFQUFFO0VBQUVDLGFBQWEsRUFBRTtBQUFHLENBQUUsQ0FBQyxFQUMxRSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLEVBQUU7RUFBRUMsWUFBWSxFQUFFLEVBQUU7RUFBRUMsYUFBYSxFQUFFO0FBQUcsQ0FBRSxDQUFDLEVBQzFFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsRUFBRTtFQUFFQyxZQUFZLEVBQUUsRUFBRTtFQUFFQyxhQUFhLEVBQUU7QUFBRyxDQUFFLENBQUMsRUFDMUUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxFQUFFO0VBQUVDLFlBQVksRUFBRSxFQUFFO0VBQUVDLGFBQWEsRUFBRTtBQUFHLENBQUUsQ0FBQyxFQUMxRSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLEVBQUU7RUFBRUMsWUFBWSxFQUFFLEVBQUU7RUFBRUMsYUFBYSxFQUFFO0FBQUcsQ0FBRSxDQUFDLEVBQzFFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsRUFBRTtFQUFFQyxZQUFZLEVBQUUsRUFBRTtFQUFFQyxhQUFhLEVBQUU7QUFBRyxDQUFFLENBQUMsRUFDMUUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxFQUFFO0VBQUVDLFlBQVksRUFBRSxFQUFFO0VBQUVDLGFBQWEsRUFBRTtBQUFHLENBQUUsQ0FBQyxFQUMxRSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLEVBQUU7RUFBRUMsWUFBWSxFQUFFLEVBQUU7RUFBRUMsYUFBYSxFQUFFO0FBQUcsQ0FBRSxDQUFDLEVBQzFFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsRUFBRTtFQUFFQyxZQUFZLEVBQUUsRUFBRTtFQUFFQyxhQUFhLEVBQUU7QUFBRyxDQUFFLENBQUMsRUFDMUUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxFQUFFO0VBQUVDLFlBQVksRUFBRSxFQUFFO0VBQUVDLGFBQWEsRUFBRTtBQUFHLENBQUUsQ0FBQyxDQUMzRSxFQUNELENBQ0UsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxDQUFDO0VBQUVDLFlBQVksRUFBRSxDQUFDO0VBQUVDLGFBQWEsRUFBRTtBQUFFLENBQUUsQ0FBQyxFQUN2RSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLENBQUM7RUFBRUMsWUFBWSxFQUFFLENBQUM7RUFBRUMsYUFBYSxFQUFFO0FBQUUsQ0FBRSxDQUFDLEVBQ3ZFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsQ0FBQztFQUFFQyxZQUFZLEVBQUUsQ0FBQztFQUFFQyxhQUFhLEVBQUU7QUFBRSxDQUFFLENBQUMsRUFDdkUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxDQUFDO0VBQUVDLFlBQVksRUFBRSxDQUFDO0VBQUVDLGFBQWEsRUFBRTtBQUFFLENBQUUsQ0FBQyxFQUN2RSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLENBQUM7RUFBRUMsWUFBWSxFQUFFLENBQUM7RUFBRUMsYUFBYSxFQUFFO0FBQUUsQ0FBRSxDQUFDLEVBQ3ZFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsQ0FBQztFQUFFQyxZQUFZLEVBQUUsQ0FBQztFQUFFQyxhQUFhLEVBQUU7QUFBRSxDQUFFLENBQUMsRUFDdkUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxDQUFDO0VBQUVDLFlBQVksRUFBRSxDQUFDO0VBQUVDLGFBQWEsRUFBRTtBQUFFLENBQUUsQ0FBQyxFQUN2RSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLENBQUM7RUFBRUMsWUFBWSxFQUFFLENBQUM7RUFBRUMsYUFBYSxFQUFFO0FBQUUsQ0FBRSxDQUFDLEVBQ3ZFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsQ0FBQztFQUFFQyxZQUFZLEVBQUUsQ0FBQztFQUFFQyxhQUFhLEVBQUU7QUFBRSxDQUFFLENBQUMsRUFDdkUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxDQUFDO0VBQUVDLFlBQVksRUFBRSxDQUFDO0VBQUVDLGFBQWEsRUFBRTtBQUFFLENBQUUsQ0FBQyxFQUN2RSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLENBQUM7RUFBRUMsWUFBWSxFQUFFLENBQUM7RUFBRUMsYUFBYSxFQUFFO0FBQUUsQ0FBRSxDQUFDLEVBQ3ZFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsQ0FBQztFQUFFQyxZQUFZLEVBQUUsQ0FBQztFQUFFQyxhQUFhLEVBQUU7QUFBRSxDQUFFLENBQUMsRUFDdkUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxDQUFDO0VBQUVDLFlBQVksRUFBRSxDQUFDO0VBQUVDLGFBQWEsRUFBRTtBQUFFLENBQUUsQ0FBQyxFQUN2RSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLENBQUM7RUFBRUMsWUFBWSxFQUFFLENBQUM7RUFBRUMsYUFBYSxFQUFFO0FBQUUsQ0FBRSxDQUFDLEVBQ3ZFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsQ0FBQztFQUFFQyxZQUFZLEVBQUUsQ0FBQztFQUFFQyxhQUFhLEVBQUU7QUFBRSxDQUFFLENBQUMsRUFDdkUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxDQUFDO0VBQUVDLFlBQVksRUFBRSxDQUFDO0VBQUVDLGFBQWEsRUFBRTtBQUFFLENBQUUsQ0FBQyxFQUN2RSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLENBQUM7RUFBRUMsWUFBWSxFQUFFLENBQUM7RUFBRUMsYUFBYSxFQUFFO0FBQUUsQ0FBRSxDQUFDLEVBQ3ZFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsQ0FBQztFQUFFQyxZQUFZLEVBQUUsQ0FBQztFQUFFQyxhQUFhLEVBQUU7QUFBRSxDQUFFLENBQUMsRUFDdkUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxDQUFDO0VBQUVDLFlBQVksRUFBRSxDQUFDO0VBQUVDLGFBQWEsRUFBRTtBQUFHLENBQUUsQ0FBQyxFQUN4RSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLENBQUM7RUFBRUMsWUFBWSxFQUFFLENBQUM7RUFBRUMsYUFBYSxFQUFFO0FBQUUsQ0FBRSxDQUFDLEVBQ3ZFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsQ0FBQztFQUFFQyxZQUFZLEVBQUUsQ0FBQztFQUFFQyxhQUFhLEVBQUU7QUFBRyxDQUFFLENBQUMsRUFDeEUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxDQUFDO0VBQUVDLFlBQVksRUFBRSxDQUFDO0VBQUVDLGFBQWEsRUFBRTtBQUFFLENBQUUsQ0FBQyxFQUN2RSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLENBQUM7RUFBRUMsWUFBWSxFQUFFLENBQUM7RUFBRUMsYUFBYSxFQUFFO0FBQUcsQ0FBRSxDQUFDLEVBQ3hFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsQ0FBQztFQUFFQyxZQUFZLEVBQUUsQ0FBQztFQUFFQyxhQUFhLEVBQUU7QUFBRSxDQUFFLENBQUMsRUFDdkUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxDQUFDO0VBQUVDLFlBQVksRUFBRSxDQUFDO0VBQUVDLGFBQWEsRUFBRTtBQUFHLENBQUUsQ0FBQyxFQUN4RSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLENBQUM7RUFBRUMsWUFBWSxFQUFFLEVBQUU7RUFBRUMsYUFBYSxFQUFFO0FBQUUsQ0FBRSxDQUFDLEVBQ3hFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsQ0FBQztFQUFFQyxZQUFZLEVBQUUsRUFBRTtFQUFFQyxhQUFhLEVBQUU7QUFBRyxDQUFFLENBQUMsRUFDekUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxDQUFDO0VBQUVDLFlBQVksRUFBRSxFQUFFO0VBQUVDLGFBQWEsRUFBRTtBQUFFLENBQUUsQ0FBQyxFQUN4RSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLENBQUM7RUFBRUMsWUFBWSxFQUFFLEVBQUU7RUFBRUMsYUFBYSxFQUFFO0FBQUcsQ0FBRSxDQUFDLEVBQ3pFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsRUFBRTtFQUFFQyxZQUFZLEVBQUUsRUFBRTtFQUFFQyxhQUFhLEVBQUU7QUFBRyxDQUFFLENBQUMsRUFDMUUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxFQUFFO0VBQUVDLFlBQVksRUFBRSxFQUFFO0VBQUVDLGFBQWEsRUFBRTtBQUFHLENBQUUsQ0FBQyxFQUMxRSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLEVBQUU7RUFBRUMsWUFBWSxFQUFFLEVBQUU7RUFBRUMsYUFBYSxFQUFFO0FBQUcsQ0FBRSxDQUFDLEVBQzFFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsRUFBRTtFQUFFQyxZQUFZLEVBQUUsRUFBRTtFQUFFQyxhQUFhLEVBQUU7QUFBRyxDQUFFLENBQUMsRUFDMUUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxFQUFFO0VBQUVDLFlBQVksRUFBRSxFQUFFO0VBQUVDLGFBQWEsRUFBRTtBQUFHLENBQUUsQ0FBQyxFQUMxRSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLEVBQUU7RUFBRUMsWUFBWSxFQUFFLEVBQUU7RUFBRUMsYUFBYSxFQUFFO0FBQUcsQ0FBRSxDQUFDLEVBQzFFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsRUFBRTtFQUFFQyxZQUFZLEVBQUUsRUFBRTtFQUFFQyxhQUFhLEVBQUU7QUFBRyxDQUFFLENBQUMsRUFDMUUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxFQUFFO0VBQUVDLFlBQVksRUFBRSxFQUFFO0VBQUVDLGFBQWEsRUFBRTtBQUFHLENBQUUsQ0FBQyxFQUMxRSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLEVBQUU7RUFBRUMsWUFBWSxFQUFFLEVBQUU7RUFBRUMsYUFBYSxFQUFFO0FBQUcsQ0FBRSxDQUFDLEVBQzFFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsRUFBRTtFQUFFQyxZQUFZLEVBQUUsRUFBRTtFQUFFQyxhQUFhLEVBQUU7QUFBRyxDQUFFLENBQUMsRUFDMUUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxFQUFFO0VBQUVDLFlBQVksRUFBRSxFQUFFO0VBQUVDLGFBQWEsRUFBRTtBQUFHLENBQUUsQ0FBQyxFQUMxRSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLEVBQUU7RUFBRUMsWUFBWSxFQUFFLEVBQUU7RUFBRUMsYUFBYSxFQUFFO0FBQUcsQ0FBRSxDQUFDLEVBQzFFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsRUFBRTtFQUFFQyxZQUFZLEVBQUUsRUFBRTtFQUFFQyxhQUFhLEVBQUU7QUFBRyxDQUFFLENBQUMsRUFDMUUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxFQUFFO0VBQUVDLFlBQVksRUFBRSxFQUFFO0VBQUVDLGFBQWEsRUFBRTtBQUFHLENBQUUsQ0FBQyxFQUMxRSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLEVBQUU7RUFBRUMsWUFBWSxFQUFFLEVBQUU7RUFBRUMsYUFBYSxFQUFFO0FBQUcsQ0FBRSxDQUFDLEVBQzFFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsRUFBRTtFQUFFQyxZQUFZLEVBQUUsRUFBRTtFQUFFQyxhQUFhLEVBQUU7QUFBRyxDQUFFLENBQUMsRUFDMUUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxFQUFFO0VBQUVDLFlBQVksRUFBRSxFQUFFO0VBQUVDLGFBQWEsRUFBRTtBQUFHLENBQUUsQ0FBQyxFQUMxRSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLEVBQUU7RUFBRUMsWUFBWSxFQUFFLEVBQUU7RUFBRUMsYUFBYSxFQUFFO0FBQUcsQ0FBRSxDQUFDLEVBQzFFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsRUFBRTtFQUFFQyxZQUFZLEVBQUUsRUFBRTtFQUFFQyxhQUFhLEVBQUU7QUFBRyxDQUFFLENBQUMsRUFDMUUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxFQUFFO0VBQUVDLFlBQVksRUFBRSxFQUFFO0VBQUVDLGFBQWEsRUFBRTtBQUFHLENBQUUsQ0FBQyxFQUMxRSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLEVBQUU7RUFBRUMsWUFBWSxFQUFFLEVBQUU7RUFBRUMsYUFBYSxFQUFFO0FBQUcsQ0FBRSxDQUFDLEVBQzFFLElBQUlMLFVBQVUsQ0FBRTtFQUFFRyxXQUFXLEVBQUUsRUFBRTtFQUFFQyxZQUFZLEVBQUUsRUFBRTtFQUFFQyxhQUFhLEVBQUU7QUFBRyxDQUFFLENBQUMsRUFDMUUsSUFBSUwsVUFBVSxDQUFFO0VBQUVHLFdBQVcsRUFBRSxFQUFFO0VBQUVDLFlBQVksRUFBRSxFQUFFO0VBQUVDLGFBQWEsRUFBRTtBQUFHLENBQUUsQ0FBQyxFQUMxRSxJQUFJTCxVQUFVLENBQUU7RUFBRUcsV0FBVyxFQUFFLEVBQUU7RUFBRUMsWUFBWSxFQUFFLEVBQUU7RUFBRUMsYUFBYSxFQUFFO0FBQUcsQ0FBRSxDQUFDLEVBQzFFLElBQUlMLFVBQVUsQ0FBRTtFQUFF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
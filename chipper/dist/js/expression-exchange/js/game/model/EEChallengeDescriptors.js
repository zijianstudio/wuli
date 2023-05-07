// Copyright 2017-2021, University of Colorado Boulder

/**
 * an array of static objects that describe the Expression Exchange challenges, organized by game level
 *
 * @author John Blanco
 */

import dotRandom from '../../../../dot/js/dotRandom.js';
import CoinTermTypeID from '../../common/enum/CoinTermTypeID.js';
import expressionExchange from '../../expressionExchange.js';
import ExpressionDescription from './ExpressionDescription.js';

// The challenge set, organized as a 2D array where the first dimension is level, the second is challenge number.
// The challenge descriptions are organized as a set of expressions that the user should construct and collect and
// a description of the contents of the coin term box.
const challengeSets = [
// level 1 challenges
[{
  expressionsToCollect: [new ExpressionDescription('2x + y'), new ExpressionDescription('2x + 2y'), new ExpressionDescription('x + 2y')],
  carouselContents: [{
    typeID: CoinTermTypeID.X,
    minimumDecomposition: 1,
    creationLimit: 5
  }, {
    typeID: CoinTermTypeID.Y,
    minimumDecomposition: 1,
    creationLimit: 5
  }]
}, {
  expressionsToCollect: [new ExpressionDescription('x + y + z'), new ExpressionDescription('2x + y'), new ExpressionDescription('2y + 2z')],
  carouselContents: [{
    typeID: CoinTermTypeID.X,
    minimumDecomposition: 1,
    creationLimit: 3
  }, {
    typeID: CoinTermTypeID.Y,
    minimumDecomposition: 1,
    creationLimit: 4
  }, {
    typeID: CoinTermTypeID.Z,
    minimumDecomposition: 1,
    creationLimit: 3
  }]
}, {
  expressionsToCollect: [new ExpressionDescription('3x + 2y'), new ExpressionDescription('y + 2z'), new ExpressionDescription('2x + 2y + 2z')],
  carouselContents: [{
    typeID: CoinTermTypeID.X,
    minimumDecomposition: 1,
    creationLimit: 5
  }, {
    typeID: CoinTermTypeID.Y,
    minimumDecomposition: 1,
    creationLimit: 5
  }, {
    typeID: CoinTermTypeID.Z,
    minimumDecomposition: 1,
    creationLimit: 4
  }]
}, {
  expressionsToCollect: [new ExpressionDescription('x + y + z'), new ExpressionDescription('2x + z'), new ExpressionDescription('x + 2y')],
  carouselContents: [{
    typeID: CoinTermTypeID.X,
    minimumDecomposition: 1,
    creationLimit: 4
  }, {
    typeID: CoinTermTypeID.Y,
    minimumDecomposition: 1,
    creationLimit: 3
  }, {
    typeID: CoinTermTypeID.Z,
    minimumDecomposition: 1,
    creationLimit: 2
  }]
}, {
  expressionsToCollect: [new ExpressionDescription('x + y'), new ExpressionDescription('2x + 2z'), new ExpressionDescription('2y + z')],
  carouselContents: [{
    typeID: CoinTermTypeID.X,
    minimumDecomposition: 1,
    creationLimit: 3
  }, {
    typeID: CoinTermTypeID.Y,
    minimumDecomposition: 1,
    creationLimit: 3
  }, {
    typeID: CoinTermTypeID.Z,
    minimumDecomposition: 1,
    creationLimit: 3
  }]
}],
// level 2
[{
  expressionsToCollect: [new ExpressionDescription('3x'), new ExpressionDescription('2x + y'), new ExpressionDescription('x + 2y')],
  carouselContents: [{
    typeID: CoinTermTypeID.X,
    minimumDecomposition: 1,
    creationLimit: 2
  }, {
    typeID: CoinTermTypeID.X,
    minimumDecomposition: 2,
    creationLimit: 2
  }, {
    typeID: CoinTermTypeID.Y,
    minimumDecomposition: 1,
    creationLimit: 3
  }]
}, {
  expressionsToCollect: [new ExpressionDescription('x + y'), new ExpressionDescription('2x + 2y'), new ExpressionDescription('x + 3y')],
  carouselContents: [{
    typeID: CoinTermTypeID.X,
    minimumDecomposition: 1,
    creationLimit: 4
  }, {
    typeID: CoinTermTypeID.Y,
    minimumDecomposition: 1,
    creationLimit: 2
  }, {
    typeID: CoinTermTypeID.Y,
    minimumDecomposition: 2,
    creationLimit: 2
  }]
}, {
  expressionsToCollect: [new ExpressionDescription('2x + 2z'), new ExpressionDescription('3x + 3y'), new ExpressionDescription('3y + 2z')],
  carouselContents: [{
    typeID: CoinTermTypeID.X,
    minimumDecomposition: 1,
    creationLimit: 1
  }, {
    typeID: CoinTermTypeID.X,
    minimumDecomposition: 2,
    creationLimit: 2
  }, {
    typeID: CoinTermTypeID.Y,
    minimumDecomposition: 3,
    creationLimit: 2
  }, {
    typeID: CoinTermTypeID.Z,
    minimumDecomposition: 2,
    creationLimit: 2
  }]
}, {
  expressionsToCollect: [new ExpressionDescription('4y + 4z'), new ExpressionDescription('2y + z'), new ExpressionDescription('y + 3z')],
  carouselContents: [{
    typeID: CoinTermTypeID.Y,
    minimumDecomposition: 1,
    creationLimit: 1
  }, {
    typeID: CoinTermTypeID.Y,
    minimumDecomposition: 2,
    creationLimit: 3
  }, {
    typeID: CoinTermTypeID.Z,
    minimumDecomposition: 1,
    creationLimit: 2
  }, {
    typeID: CoinTermTypeID.Z,
    minimumDecomposition: 2,
    creationLimit: 3
  }]
}, {
  expressionsToCollect: [new ExpressionDescription('4x'), new ExpressionDescription('x + 2y'), new ExpressionDescription('2x + 2y')],
  carouselContents: [{
    typeID: CoinTermTypeID.X,
    minimumDecomposition: 1,
    creationLimit: 3
  }, {
    typeID: CoinTermTypeID.X,
    minimumDecomposition: 2,
    creationLimit: 2
  }, {
    typeID: CoinTermTypeID.Y,
    minimumDecomposition: 1,
    creationLimit: 2
  }, {
    typeID: CoinTermTypeID.Y,
    minimumDecomposition: 2,
    creationLimit: 1
  }]
}],
// level 3
[{
  expressionsToCollect: [new ExpressionDescription('5x'), new ExpressionDescription('5x'), new ExpressionDescription('5x')],
  carouselContents: [{
    typeID: CoinTermTypeID.X,
    minimumDecomposition: 1,
    creationLimit: 7
  }, {
    typeID: CoinTermTypeID.X,
    minimumDecomposition: 2,
    creationLimit: 2
  }, {
    typeID: CoinTermTypeID.X,
    minimumDecomposition: 4,
    creationLimit: 1
  }]
}, {
  expressionsToCollect: [new ExpressionDescription('4x'), new ExpressionDescription('4x'), new ExpressionDescription('4x')],
  carouselContents: [{
    typeID: CoinTermTypeID.X,
    minimumDecomposition: 1,
    creationLimit: 5
  }, {
    typeID: CoinTermTypeID.X,
    minimumDecomposition: 2,
    creationLimit: 2
  }, {
    typeID: CoinTermTypeID.X,
    minimumDecomposition: 3,
    creationLimit: 1
  }]
}, {
  expressionsToCollect: [new ExpressionDescription('5y'), new ExpressionDescription('5y'), new ExpressionDescription('5y')],
  carouselContents: [{
    typeID: CoinTermTypeID.Y,
    minimumDecomposition: 1,
    creationLimit: 3
  }, {
    typeID: CoinTermTypeID.Y,
    minimumDecomposition: 2,
    creationLimit: 3
  }, {
    typeID: CoinTermTypeID.Y,
    minimumDecomposition: 3,
    creationLimit: 2
  }]
}, {
  expressionsToCollect: [new ExpressionDescription('6y'), new ExpressionDescription('6y'), new ExpressionDescription('6y')],
  carouselContents: [{
    typeID: CoinTermTypeID.Y,
    minimumDecomposition: 1,
    creationLimit: 5
  }, {
    typeID: CoinTermTypeID.Y,
    minimumDecomposition: 3,
    creationLimit: 3
  }, {
    typeID: CoinTermTypeID.Y,
    minimumDecomposition: 4,
    creationLimit: 1
  }]
}, {
  expressionsToCollect: [new ExpressionDescription('5z'), new ExpressionDescription('5z'), new ExpressionDescription('5z')],
  carouselContents: [{
    typeID: CoinTermTypeID.Z,
    minimumDecomposition: 1,
    creationLimit: 8
  }, {
    typeID: CoinTermTypeID.Z,
    minimumDecomposition: 3,
    creationLimit: 1
  }, {
    typeID: CoinTermTypeID.Z,
    minimumDecomposition: 4,
    creationLimit: 1
  }]
}],
// level 4
[{
  expressionsToCollect: [new ExpressionDescription('3x'), new ExpressionDescription('2x + x^2'), new ExpressionDescription('x + 2x^2')],
  carouselContents: [{
    typeID: CoinTermTypeID.X,
    minimumDecomposition: 1,
    creationLimit: 2
  }, {
    typeID: CoinTermTypeID.X,
    minimumDecomposition: 2,
    creationLimit: 2
  }, {
    typeID: CoinTermTypeID.X_SQUARED,
    minimumDecomposition: 1,
    creationLimit: 3
  }]
}, {
  expressionsToCollect: [new ExpressionDescription('x + y'), new ExpressionDescription('2x + 2y'), new ExpressionDescription('x + 3y')],
  carouselContents: [{
    typeID: CoinTermTypeID.X,
    minimumDecomposition: 1,
    creationLimit: 4
  }, {
    typeID: CoinTermTypeID.Y,
    minimumDecomposition: 1,
    creationLimit: 2
  }, {
    typeID: CoinTermTypeID.Y,
    minimumDecomposition: 2,
    creationLimit: 2
  }]
}, {
  expressionsToCollect: [new ExpressionDescription('2x + 2z'), new ExpressionDescription('3x + 3y'), new ExpressionDescription('3y + 2z')],
  carouselContents: [{
    typeID: CoinTermTypeID.X,
    minimumDecomposition: 1,
    creationLimit: 1
  }, {
    typeID: CoinTermTypeID.X,
    minimumDecomposition: 2,
    creationLimit: 2
  }, {
    typeID: CoinTermTypeID.Y,
    minimumDecomposition: 3,
    creationLimit: 2
  }, {
    typeID: CoinTermTypeID.Z,
    minimumDecomposition: 2,
    creationLimit: 2
  }]
}, {
  expressionsToCollect: [new ExpressionDescription('4y + 4z'), new ExpressionDescription('2y + z'), new ExpressionDescription('y + 3z')],
  carouselContents: [{
    typeID: CoinTermTypeID.Y,
    minimumDecomposition: 1,
    creationLimit: 1
  }, {
    typeID: CoinTermTypeID.Y,
    minimumDecomposition: 2,
    creationLimit: 3
  }, {
    typeID: CoinTermTypeID.Z,
    minimumDecomposition: 1,
    creationLimit: 2
  }, {
    typeID: CoinTermTypeID.Z,
    minimumDecomposition: 2,
    creationLimit: 3
  }]
}, {
  expressionsToCollect: [new ExpressionDescription('4y'), new ExpressionDescription('y + 2y^2'), new ExpressionDescription('2y + 2y^2')],
  carouselContents: [{
    typeID: CoinTermTypeID.Y,
    minimumDecomposition: 1,
    creationLimit: 3
  }, {
    typeID: CoinTermTypeID.Y,
    minimumDecomposition: 2,
    creationLimit: 2
  }, {
    typeID: CoinTermTypeID.Y_SQUARED,
    minimumDecomposition: 1,
    creationLimit: 2
  }, {
    typeID: CoinTermTypeID.Y_SQUARED,
    minimumDecomposition: 2,
    creationLimit: 1
  }]
}],
// level 5
[{
  expressionsToCollect: [new ExpressionDescription('2x - 3'), new ExpressionDescription('x - 2'), new ExpressionDescription('-x + 2')],
  carouselContents: [{
    typeID: CoinTermTypeID.X,
    minimumDecomposition: 2,
    creationLimit: 2
  }, {
    typeID: CoinTermTypeID.X,
    minimumDecomposition: -1,
    creationLimit: 2
  }, {
    typeID: CoinTermTypeID.CONSTANT,
    minimumDecomposition: 1,
    creationLimit: 2
  }, {
    typeID: CoinTermTypeID.CONSTANT,
    minimumDecomposition: -1,
    creationLimit: 5
  }]
}, {
  expressionsToCollect: [new ExpressionDescription('5x^2 + y'), new ExpressionDescription('4x^2 - 2y'), new ExpressionDescription('3x^2 + 4y')],
  carouselContents: [{
    typeID: CoinTermTypeID.X_SQUARED,
    minimumDecomposition: 2,
    creationLimit: 3
  }, {
    typeID: CoinTermTypeID.X_SQUARED,
    minimumDecomposition: 3,
    creationLimit: 2
  }, {
    typeID: CoinTermTypeID.Y,
    minimumDecomposition: 2,
    creationLimit: 3
  }, {
    typeID: CoinTermTypeID.Y,
    minimumDecomposition: -1,
    creationLimit: 3
  }]
}, {
  expressionsToCollect: [new ExpressionDescription('y - 2x'), new ExpressionDescription('2xy'), new ExpressionDescription('3x + 2y')],
  carouselContents: [{
    typeID: CoinTermTypeID.X,
    minimumDecomposition: 1,
    creationLimit: 3
  }, {
    typeID: CoinTermTypeID.X,
    minimumDecomposition: -2,
    creationLimit: 1
  }, {
    typeID: CoinTermTypeID.Y,
    minimumDecomposition: 1,
    creationLimit: 3
  }, {
    typeID: CoinTermTypeID.X_TIMES_Y,
    minimumDecomposition: 1,
    creationLimit: 2
  }]
}, {
  expressionsToCollect: [new ExpressionDescription('-y + 2xy'), new ExpressionDescription('2y + xy'), new ExpressionDescription('2xy - 3y')],
  carouselContents: [{
    typeID: CoinTermTypeID.Y,
    minimumDecomposition: 1,
    creationLimit: 2
  }, {
    typeID: CoinTermTypeID.Y,
    minimumDecomposition: -1,
    creationLimit: 4
  }, {
    typeID: CoinTermTypeID.X_TIMES_Y,
    minimumDecomposition: 1,
    creationLimit: 5
  }]
}, {
  expressionsToCollect: [new ExpressionDescription('2y^2 - 2'), new ExpressionDescription('2 - 2y^2'), new ExpressionDescription('2y^2 + 2')],
  carouselContents: [{
    typeID: CoinTermTypeID.Y_SQUARED,
    minimumDecomposition: 1,
    creationLimit: 4
  }, {
    typeID: CoinTermTypeID.Y_SQUARED,
    minimumDecomposition: -1,
    creationLimit: 2
  }, {
    typeID: CoinTermTypeID.CONSTANT,
    minimumDecomposition: 1,
    creationLimit: 4
  }, {
    typeID: CoinTermTypeID.CONSTANT,
    minimumDecomposition: -1,
    creationLimit: 2
  }]
}],
// level 6
[{
  expressionsToCollect: [new ExpressionDescription('-3x'), new ExpressionDescription('-3x'), new ExpressionDescription('-3x')],
  carouselContents: [{
    typeID: CoinTermTypeID.X,
    minimumDecomposition: -4,
    creationLimit: 1
  }, {
    typeID: CoinTermTypeID.X,
    minimumDecomposition: -2,
    creationLimit: 1
  }, {
    typeID: CoinTermTypeID.X,
    minimumDecomposition: -1,
    creationLimit: 4
  }, {
    typeID: CoinTermTypeID.X,
    minimumDecomposition: 1,
    creationLimit: 1
  }]
}, {
  expressionsToCollect: [new ExpressionDescription('3x - y'), new ExpressionDescription('3x - y'), new ExpressionDescription('3x - y')],
  carouselContents: [{
    typeID: CoinTermTypeID.X,
    minimumDecomposition: 1,
    creationLimit: 4
  }, {
    typeID: CoinTermTypeID.X,
    minimumDecomposition: 2,
    creationLimit: 1
  }, {
    typeID: CoinTermTypeID.X,
    minimumDecomposition: 3,
    creationLimit: 1
  }, {
    typeID: CoinTermTypeID.Y,
    minimumDecomposition: -1,
    creationLimit: 3
  }]
}, {
  expressionsToCollect: [new ExpressionDescription('-5z'), new ExpressionDescription('-5z'), new ExpressionDescription('-5z')],
  carouselContents: [{
    typeID: CoinTermTypeID.Z,
    minimumDecomposition: -1,
    creationLimit: 7
  }, {
    typeID: CoinTermTypeID.Z,
    minimumDecomposition: -2,
    creationLimit: 2
  }, {
    typeID: CoinTermTypeID.Z,
    minimumDecomposition: -4,
    creationLimit: 1
  }]
}, {
  expressionsToCollect: [new ExpressionDescription('3y - 2'), new ExpressionDescription('3y - 2'), new ExpressionDescription('3y - 2')],
  carouselContents: [{
    typeID: CoinTermTypeID.Y,
    minimumDecomposition: 2,
    creationLimit: 4
  }, {
    typeID: CoinTermTypeID.Y,
    minimumDecomposition: 1,
    creationLimit: 2
  }, {
    typeID: CoinTermTypeID.Y,
    minimumDecomposition: -1,
    creationLimit: 1
  }, {
    typeID: CoinTermTypeID.CONSTANT,
    minimumDecomposition: -2,
    creationLimit: 3
  }]
}, {
  expressionsToCollect: [new ExpressionDescription('4y - 1'), new ExpressionDescription('4y - 1'), new ExpressionDescription('4y - 1')],
  carouselContents: [{
    typeID: CoinTermTypeID.Y,
    minimumDecomposition: 1,
    creationLimit: 5
  }, {
    typeID: CoinTermTypeID.Y,
    minimumDecomposition: 2,
    creationLimit: 2
  }, {
    typeID: CoinTermTypeID.Y,
    minimumDecomposition: 3,
    creationLimit: 1
  }, {
    typeID: CoinTermTypeID.CONSTANT,
    minimumDecomposition: -1,
    creationLimit: 3
  }]
}],
// level 7
[{
  expressionsToCollect: [new ExpressionDescription('2(x - 1)'), new ExpressionDescription('1(2x - 2)'), new ExpressionDescription('2(x + 3)')],
  carouselContents: [{
    typeID: CoinTermTypeID.X,
    minimumDecomposition: 1,
    creationLimit: 4
  }, {
    typeID: CoinTermTypeID.X,
    minimumDecomposition: 2,
    creationLimit: 1
  }, {
    typeID: CoinTermTypeID.CONSTANT,
    minimumDecomposition: 1,
    creationLimit: 6
  }, {
    typeID: CoinTermTypeID.CONSTANT,
    minimumDecomposition: -1,
    creationLimit: 4
  }]
}, {
  expressionsToCollect: [new ExpressionDescription('2(2x + y)'), new ExpressionDescription('1(3y - x)'), new ExpressionDescription('2(2x + y)')],
  carouselContents: [{
    typeID: CoinTermTypeID.X,
    minimumDecomposition: 1,
    creationLimit: 4
  }, {
    typeID: CoinTermTypeID.X,
    minimumDecomposition: 2,
    creationLimit: 2
  }, {
    typeID: CoinTermTypeID.X,
    minimumDecomposition: -1,
    creationLimit: 1
  }, {
    typeID: CoinTermTypeID.Y,
    minimumDecomposition: 1,
    creationLimit: 7
  }]
}, {
  expressionsToCollect: [new ExpressionDescription('2(y + 3)'), new ExpressionDescription('3(y - 1)'), new ExpressionDescription('2(1 + y)')],
  carouselContents: [{
    typeID: CoinTermTypeID.Y,
    minimumDecomposition: 1,
    creationLimit: 7
  }, {
    typeID: CoinTermTypeID.CONSTANT,
    minimumDecomposition: 1,
    creationLimit: 2
  }, {
    typeID: CoinTermTypeID.CONSTANT,
    minimumDecomposition: 3,
    creationLimit: 2
  }, {
    typeID: CoinTermTypeID.CONSTANT,
    minimumDecomposition: -1,
    creationLimit: 3
  }]
}, {
  expressionsToCollect: [new ExpressionDescription('1(3y - z)'), new ExpressionDescription('2(y + 2z)'), new ExpressionDescription('3(y - z)')],
  carouselContents: [{
    typeID: CoinTermTypeID.Y,
    minimumDecomposition: 1,
    creationLimit: 5
  }, {
    typeID: CoinTermTypeID.Y,
    minimumDecomposition: 3,
    creationLimit: 1
  }, {
    typeID: CoinTermTypeID.Z,
    minimumDecomposition: 2,
    creationLimit: 2
  }, {
    typeID: CoinTermTypeID.Z,
    minimumDecomposition: -1,
    creationLimit: 4
  }]
}, {
  expressionsToCollect: [new ExpressionDescription('2(x - 2y)'), new ExpressionDescription('3(x + y)'), new ExpressionDescription('2(2x - y)')],
  carouselContents: [{
    typeID: CoinTermTypeID.X,
    minimumDecomposition: 1,
    creationLimit: 5
  }, {
    typeID: CoinTermTypeID.X,
    minimumDecomposition: 2,
    creationLimit: 2
  }, {
    typeID: CoinTermTypeID.Y,
    minimumDecomposition: 1,
    creationLimit: 3
  }, {
    typeID: CoinTermTypeID.Y,
    minimumDecomposition: -1,
    creationLimit: 6
  }]
}],
// level 8
[{
  expressionsToCollect: [new ExpressionDescription('x(x + 1) + 1'), new ExpressionDescription('3(x^2 + 1)'), new ExpressionDescription('2(x - 2)')],
  carouselContents: [{
    typeID: CoinTermTypeID.CONSTANT,
    minimumDecomposition: 1,
    creationLimit: 5
  }, {
    typeID: CoinTermTypeID.CONSTANT,
    minimumDecomposition: -1,
    creationLimit: 5
  }, {
    typeID: CoinTermTypeID.X,
    minimumDecomposition: 1,
    creationLimit: 4
  }, {
    typeID: CoinTermTypeID.X_SQUARED,
    minimumDecomposition: 1,
    creationLimit: 4
  }]
}, {
  expressionsToCollect: [new ExpressionDescription('2x - (x + 1)'), new ExpressionDescription('x + 2(x - 1)'), new ExpressionDescription('x(x + 1)')],
  carouselContents: [{
    typeID: CoinTermTypeID.X,
    minimumDecomposition: 1,
    creationLimit: 5
  }, {
    typeID: CoinTermTypeID.X_SQUARED,
    minimumDecomposition: 1,
    creationLimit: 3
  }, {
    typeID: CoinTermTypeID.CONSTANT,
    minimumDecomposition: -1,
    creationLimit: 3
  }, {
    typeID: CoinTermTypeID.CONSTANT,
    minimumDecomposition: 1,
    creationLimit: 2
  }]
}, {
  expressionsToCollect: [new ExpressionDescription('-1(x - 2)'), new ExpressionDescription('3 + x(x - 2)'), new ExpressionDescription('3(x^2 + 1) ')],
  carouselContents: [{
    typeID: CoinTermTypeID.X,
    minimumDecomposition: -1,
    creationLimit: 3
  }, {
    typeID: CoinTermTypeID.X_SQUARED,
    minimumDecomposition: 1,
    creationLimit: 4
  }, {
    typeID: CoinTermTypeID.CONSTANT,
    minimumDecomposition: 1,
    creationLimit: 8
  }, {
    typeID: CoinTermTypeID.CONSTANT,
    minimumDecomposition: -1,
    creationLimit: 2
  }]
}, {
  expressionsToCollect: [new ExpressionDescription('-2(x^2 - 1)'), new ExpressionDescription('3(x^2 + x)'), new ExpressionDescription('x(x + 2) + 1')],
  carouselContents: [{
    typeID: CoinTermTypeID.CONSTANT,
    minimumDecomposition: 1,
    creationLimit: 3
  }, {
    typeID: CoinTermTypeID.X,
    minimumDecomposition: 1,
    creationLimit: 5
  }, {
    typeID: CoinTermTypeID.X_SQUARED,
    minimumDecomposition: 1,
    creationLimit: 6
  }, {
    typeID: CoinTermTypeID.X_SQUARED,
    minimumDecomposition: -1,
    creationLimit: 2
  }]
}, {
  expressionsToCollect: [new ExpressionDescription('x - (x + 2)'), new ExpressionDescription('x(2x + 1)'), new ExpressionDescription('2(x^2 - 1)')],
  carouselContents: [{
    typeID: CoinTermTypeID.X,
    minimumDecomposition: 1,
    creationLimit: 2
  }, {
    typeID: CoinTermTypeID.X,
    minimumDecomposition: -1,
    creationLimit: 3
  }, {
    typeID: CoinTermTypeID.CONSTANT,
    minimumDecomposition: -1,
    creationLimit: 4
  }, {
    typeID: CoinTermTypeID.X_SQUARED,
    minimumDecomposition: 1,
    creationLimit: 4
  }]
}]];

/**
 * static object with methods for accessing the challenge descriptors defined above
 */
const EEChallengeDescriptors = {
  /**
   * get a challenge descriptor for the specified level
   * @param {number} level
   * @param {number} challengeNumber
   * @returns {EEChallengeDescriptor}
   * @public
   */
  getChallengeDescriptor(level, challengeNumber) {
    return challengeSets[level][challengeNumber];
  },
  /**
   * randomize the challenge sets
   * @public
   */
  shuffleChallenges() {
    for (let i = 0; i < challengeSets.length; i++) {
      challengeSets[i] = dotRandom.shuffle(challengeSets[i]);
    }
  },
  //@public
  CHALLENGES_PER_LEVEL: 5
};
expressionExchange.register('EEChallengeDescriptors', EEChallengeDescriptors);
export default EEChallengeDescriptors;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkb3RSYW5kb20iLCJDb2luVGVybVR5cGVJRCIsImV4cHJlc3Npb25FeGNoYW5nZSIsIkV4cHJlc3Npb25EZXNjcmlwdGlvbiIsImNoYWxsZW5nZVNldHMiLCJleHByZXNzaW9uc1RvQ29sbGVjdCIsImNhcm91c2VsQ29udGVudHMiLCJ0eXBlSUQiLCJYIiwibWluaW11bURlY29tcG9zaXRpb24iLCJjcmVhdGlvbkxpbWl0IiwiWSIsIloiLCJYX1NRVUFSRUQiLCJZX1NRVUFSRUQiLCJDT05TVEFOVCIsIlhfVElNRVNfWSIsIkVFQ2hhbGxlbmdlRGVzY3JpcHRvcnMiLCJnZXRDaGFsbGVuZ2VEZXNjcmlwdG9yIiwibGV2ZWwiLCJjaGFsbGVuZ2VOdW1iZXIiLCJzaHVmZmxlQ2hhbGxlbmdlcyIsImkiLCJsZW5ndGgiLCJzaHVmZmxlIiwiQ0hBTExFTkdFU19QRVJfTEVWRUwiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkVFQ2hhbGxlbmdlRGVzY3JpcHRvcnMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogYW4gYXJyYXkgb2Ygc3RhdGljIG9iamVjdHMgdGhhdCBkZXNjcmliZSB0aGUgRXhwcmVzc2lvbiBFeGNoYW5nZSBjaGFsbGVuZ2VzLCBvcmdhbml6ZWQgYnkgZ2FtZSBsZXZlbFxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqL1xyXG5cclxuaW1wb3J0IGRvdFJhbmRvbSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvZG90UmFuZG9tLmpzJztcclxuaW1wb3J0IENvaW5UZXJtVHlwZUlEIGZyb20gJy4uLy4uL2NvbW1vbi9lbnVtL0NvaW5UZXJtVHlwZUlELmpzJztcclxuaW1wb3J0IGV4cHJlc3Npb25FeGNoYW5nZSBmcm9tICcuLi8uLi9leHByZXNzaW9uRXhjaGFuZ2UuanMnO1xyXG5pbXBvcnQgRXhwcmVzc2lvbkRlc2NyaXB0aW9uIGZyb20gJy4vRXhwcmVzc2lvbkRlc2NyaXB0aW9uLmpzJztcclxuXHJcbi8vIFRoZSBjaGFsbGVuZ2Ugc2V0LCBvcmdhbml6ZWQgYXMgYSAyRCBhcnJheSB3aGVyZSB0aGUgZmlyc3QgZGltZW5zaW9uIGlzIGxldmVsLCB0aGUgc2Vjb25kIGlzIGNoYWxsZW5nZSBudW1iZXIuXHJcbi8vIFRoZSBjaGFsbGVuZ2UgZGVzY3JpcHRpb25zIGFyZSBvcmdhbml6ZWQgYXMgYSBzZXQgb2YgZXhwcmVzc2lvbnMgdGhhdCB0aGUgdXNlciBzaG91bGQgY29uc3RydWN0IGFuZCBjb2xsZWN0IGFuZFxyXG4vLyBhIGRlc2NyaXB0aW9uIG9mIHRoZSBjb250ZW50cyBvZiB0aGUgY29pbiB0ZXJtIGJveC5cclxuY29uc3QgY2hhbGxlbmdlU2V0cyA9IFtcclxuXHJcbiAgLy8gbGV2ZWwgMSBjaGFsbGVuZ2VzXHJcbiAgW1xyXG4gICAge1xyXG4gICAgICBleHByZXNzaW9uc1RvQ29sbGVjdDogW1xyXG4gICAgICAgIG5ldyBFeHByZXNzaW9uRGVzY3JpcHRpb24oICcyeCArIHknICksXHJcbiAgICAgICAgbmV3IEV4cHJlc3Npb25EZXNjcmlwdGlvbiggJzJ4ICsgMnknICksXHJcbiAgICAgICAgbmV3IEV4cHJlc3Npb25EZXNjcmlwdGlvbiggJ3ggKyAyeScgKVxyXG4gICAgICBdLFxyXG4gICAgICBjYXJvdXNlbENvbnRlbnRzOiBbXHJcbiAgICAgICAgeyB0eXBlSUQ6IENvaW5UZXJtVHlwZUlELlgsIG1pbmltdW1EZWNvbXBvc2l0aW9uOiAxLCBjcmVhdGlvbkxpbWl0OiA1IH0sXHJcbiAgICAgICAgeyB0eXBlSUQ6IENvaW5UZXJtVHlwZUlELlksIG1pbmltdW1EZWNvbXBvc2l0aW9uOiAxLCBjcmVhdGlvbkxpbWl0OiA1IH1cclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgZXhwcmVzc2lvbnNUb0NvbGxlY3Q6IFtcclxuICAgICAgICBuZXcgRXhwcmVzc2lvbkRlc2NyaXB0aW9uKCAneCArIHkgKyB6JyApLFxyXG4gICAgICAgIG5ldyBFeHByZXNzaW9uRGVzY3JpcHRpb24oICcyeCArIHknICksXHJcbiAgICAgICAgbmV3IEV4cHJlc3Npb25EZXNjcmlwdGlvbiggJzJ5ICsgMnonIClcclxuICAgICAgXSxcclxuICAgICAgY2Fyb3VzZWxDb250ZW50czogW1xyXG4gICAgICAgIHsgdHlwZUlEOiBDb2luVGVybVR5cGVJRC5YLCBtaW5pbXVtRGVjb21wb3NpdGlvbjogMSwgY3JlYXRpb25MaW1pdDogMyB9LFxyXG4gICAgICAgIHsgdHlwZUlEOiBDb2luVGVybVR5cGVJRC5ZLCBtaW5pbXVtRGVjb21wb3NpdGlvbjogMSwgY3JlYXRpb25MaW1pdDogNCB9LFxyXG4gICAgICAgIHsgdHlwZUlEOiBDb2luVGVybVR5cGVJRC5aLCBtaW5pbXVtRGVjb21wb3NpdGlvbjogMSwgY3JlYXRpb25MaW1pdDogMyB9XHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGV4cHJlc3Npb25zVG9Db2xsZWN0OiBbXHJcbiAgICAgICAgbmV3IEV4cHJlc3Npb25EZXNjcmlwdGlvbiggJzN4ICsgMnknICksXHJcbiAgICAgICAgbmV3IEV4cHJlc3Npb25EZXNjcmlwdGlvbiggJ3kgKyAyeicgKSxcclxuICAgICAgICBuZXcgRXhwcmVzc2lvbkRlc2NyaXB0aW9uKCAnMnggKyAyeSArIDJ6JyApXHJcbiAgICAgIF0sXHJcbiAgICAgIGNhcm91c2VsQ29udGVudHM6IFtcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuWCwgbWluaW11bURlY29tcG9zaXRpb246IDEsIGNyZWF0aW9uTGltaXQ6IDUgfSxcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuWSwgbWluaW11bURlY29tcG9zaXRpb246IDEsIGNyZWF0aW9uTGltaXQ6IDUgfSxcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuWiwgbWluaW11bURlY29tcG9zaXRpb246IDEsIGNyZWF0aW9uTGltaXQ6IDQgfVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBleHByZXNzaW9uc1RvQ29sbGVjdDogW1xyXG4gICAgICAgIG5ldyBFeHByZXNzaW9uRGVzY3JpcHRpb24oICd4ICsgeSArIHonICksXHJcbiAgICAgICAgbmV3IEV4cHJlc3Npb25EZXNjcmlwdGlvbiggJzJ4ICsgeicgKSxcclxuICAgICAgICBuZXcgRXhwcmVzc2lvbkRlc2NyaXB0aW9uKCAneCArIDJ5JyApXHJcbiAgICAgIF0sXHJcbiAgICAgIGNhcm91c2VsQ29udGVudHM6IFtcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuWCwgbWluaW11bURlY29tcG9zaXRpb246IDEsIGNyZWF0aW9uTGltaXQ6IDQgfSxcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuWSwgbWluaW11bURlY29tcG9zaXRpb246IDEsIGNyZWF0aW9uTGltaXQ6IDMgfSxcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuWiwgbWluaW11bURlY29tcG9zaXRpb246IDEsIGNyZWF0aW9uTGltaXQ6IDIgfVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBleHByZXNzaW9uc1RvQ29sbGVjdDogW1xyXG4gICAgICAgIG5ldyBFeHByZXNzaW9uRGVzY3JpcHRpb24oICd4ICsgeScgKSxcclxuICAgICAgICBuZXcgRXhwcmVzc2lvbkRlc2NyaXB0aW9uKCAnMnggKyAyeicgKSxcclxuICAgICAgICBuZXcgRXhwcmVzc2lvbkRlc2NyaXB0aW9uKCAnMnkgKyB6JyApXHJcbiAgICAgIF0sXHJcbiAgICAgIGNhcm91c2VsQ29udGVudHM6IFtcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuWCwgbWluaW11bURlY29tcG9zaXRpb246IDEsIGNyZWF0aW9uTGltaXQ6IDMgfSxcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuWSwgbWluaW11bURlY29tcG9zaXRpb246IDEsIGNyZWF0aW9uTGltaXQ6IDMgfSxcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuWiwgbWluaW11bURlY29tcG9zaXRpb246IDEsIGNyZWF0aW9uTGltaXQ6IDMgfVxyXG4gICAgICBdXHJcbiAgICB9XHJcbiAgXSxcclxuXHJcbiAgLy8gbGV2ZWwgMlxyXG4gIFtcclxuICAgIHtcclxuICAgICAgZXhwcmVzc2lvbnNUb0NvbGxlY3Q6IFtcclxuICAgICAgICBuZXcgRXhwcmVzc2lvbkRlc2NyaXB0aW9uKCAnM3gnICksXHJcbiAgICAgICAgbmV3IEV4cHJlc3Npb25EZXNjcmlwdGlvbiggJzJ4ICsgeScgKSxcclxuICAgICAgICBuZXcgRXhwcmVzc2lvbkRlc2NyaXB0aW9uKCAneCArIDJ5JyApXHJcbiAgICAgIF0sXHJcbiAgICAgIGNhcm91c2VsQ29udGVudHM6IFtcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuWCwgbWluaW11bURlY29tcG9zaXRpb246IDEsIGNyZWF0aW9uTGltaXQ6IDIgfSxcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuWCwgbWluaW11bURlY29tcG9zaXRpb246IDIsIGNyZWF0aW9uTGltaXQ6IDIgfSxcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuWSwgbWluaW11bURlY29tcG9zaXRpb246IDEsIGNyZWF0aW9uTGltaXQ6IDMgfVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBleHByZXNzaW9uc1RvQ29sbGVjdDogW1xyXG4gICAgICAgIG5ldyBFeHByZXNzaW9uRGVzY3JpcHRpb24oICd4ICsgeScgKSxcclxuICAgICAgICBuZXcgRXhwcmVzc2lvbkRlc2NyaXB0aW9uKCAnMnggKyAyeScgKSxcclxuICAgICAgICBuZXcgRXhwcmVzc2lvbkRlc2NyaXB0aW9uKCAneCArIDN5JyApXHJcbiAgICAgIF0sXHJcbiAgICAgIGNhcm91c2VsQ29udGVudHM6IFtcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuWCwgbWluaW11bURlY29tcG9zaXRpb246IDEsIGNyZWF0aW9uTGltaXQ6IDQgfSxcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuWSwgbWluaW11bURlY29tcG9zaXRpb246IDEsIGNyZWF0aW9uTGltaXQ6IDIgfSxcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuWSwgbWluaW11bURlY29tcG9zaXRpb246IDIsIGNyZWF0aW9uTGltaXQ6IDIgfVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBleHByZXNzaW9uc1RvQ29sbGVjdDogW1xyXG4gICAgICAgIG5ldyBFeHByZXNzaW9uRGVzY3JpcHRpb24oICcyeCArIDJ6JyApLFxyXG4gICAgICAgIG5ldyBFeHByZXNzaW9uRGVzY3JpcHRpb24oICczeCArIDN5JyApLFxyXG4gICAgICAgIG5ldyBFeHByZXNzaW9uRGVzY3JpcHRpb24oICczeSArIDJ6JyApXHJcbiAgICAgIF0sXHJcbiAgICAgIGNhcm91c2VsQ29udGVudHM6IFtcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuWCwgbWluaW11bURlY29tcG9zaXRpb246IDEsIGNyZWF0aW9uTGltaXQ6IDEgfSxcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuWCwgbWluaW11bURlY29tcG9zaXRpb246IDIsIGNyZWF0aW9uTGltaXQ6IDIgfSxcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuWSwgbWluaW11bURlY29tcG9zaXRpb246IDMsIGNyZWF0aW9uTGltaXQ6IDIgfSxcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuWiwgbWluaW11bURlY29tcG9zaXRpb246IDIsIGNyZWF0aW9uTGltaXQ6IDIgfVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBleHByZXNzaW9uc1RvQ29sbGVjdDogW1xyXG4gICAgICAgIG5ldyBFeHByZXNzaW9uRGVzY3JpcHRpb24oICc0eSArIDR6JyApLFxyXG4gICAgICAgIG5ldyBFeHByZXNzaW9uRGVzY3JpcHRpb24oICcyeSArIHonICksXHJcbiAgICAgICAgbmV3IEV4cHJlc3Npb25EZXNjcmlwdGlvbiggJ3kgKyAzeicgKVxyXG4gICAgICBdLFxyXG4gICAgICBjYXJvdXNlbENvbnRlbnRzOiBbXHJcbiAgICAgICAgeyB0eXBlSUQ6IENvaW5UZXJtVHlwZUlELlksIG1pbmltdW1EZWNvbXBvc2l0aW9uOiAxLCBjcmVhdGlvbkxpbWl0OiAxIH0sXHJcbiAgICAgICAgeyB0eXBlSUQ6IENvaW5UZXJtVHlwZUlELlksIG1pbmltdW1EZWNvbXBvc2l0aW9uOiAyLCBjcmVhdGlvbkxpbWl0OiAzIH0sXHJcbiAgICAgICAgeyB0eXBlSUQ6IENvaW5UZXJtVHlwZUlELlosIG1pbmltdW1EZWNvbXBvc2l0aW9uOiAxLCBjcmVhdGlvbkxpbWl0OiAyIH0sXHJcbiAgICAgICAgeyB0eXBlSUQ6IENvaW5UZXJtVHlwZUlELlosIG1pbmltdW1EZWNvbXBvc2l0aW9uOiAyLCBjcmVhdGlvbkxpbWl0OiAzIH1cclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgZXhwcmVzc2lvbnNUb0NvbGxlY3Q6IFtcclxuICAgICAgICBuZXcgRXhwcmVzc2lvbkRlc2NyaXB0aW9uKCAnNHgnICksXHJcbiAgICAgICAgbmV3IEV4cHJlc3Npb25EZXNjcmlwdGlvbiggJ3ggKyAyeScgKSxcclxuICAgICAgICBuZXcgRXhwcmVzc2lvbkRlc2NyaXB0aW9uKCAnMnggKyAyeScgKVxyXG4gICAgICBdLFxyXG4gICAgICBjYXJvdXNlbENvbnRlbnRzOiBbXHJcbiAgICAgICAgeyB0eXBlSUQ6IENvaW5UZXJtVHlwZUlELlgsIG1pbmltdW1EZWNvbXBvc2l0aW9uOiAxLCBjcmVhdGlvbkxpbWl0OiAzIH0sXHJcbiAgICAgICAgeyB0eXBlSUQ6IENvaW5UZXJtVHlwZUlELlgsIG1pbmltdW1EZWNvbXBvc2l0aW9uOiAyLCBjcmVhdGlvbkxpbWl0OiAyIH0sXHJcbiAgICAgICAgeyB0eXBlSUQ6IENvaW5UZXJtVHlwZUlELlksIG1pbmltdW1EZWNvbXBvc2l0aW9uOiAxLCBjcmVhdGlvbkxpbWl0OiAyIH0sXHJcbiAgICAgICAgeyB0eXBlSUQ6IENvaW5UZXJtVHlwZUlELlksIG1pbmltdW1EZWNvbXBvc2l0aW9uOiAyLCBjcmVhdGlvbkxpbWl0OiAxIH1cclxuICAgICAgXVxyXG4gICAgfVxyXG4gIF0sXHJcblxyXG4gIC8vIGxldmVsIDNcclxuICBbXHJcbiAgICB7XHJcbiAgICAgIGV4cHJlc3Npb25zVG9Db2xsZWN0OiBbXHJcbiAgICAgICAgbmV3IEV4cHJlc3Npb25EZXNjcmlwdGlvbiggJzV4JyApLFxyXG4gICAgICAgIG5ldyBFeHByZXNzaW9uRGVzY3JpcHRpb24oICc1eCcgKSxcclxuICAgICAgICBuZXcgRXhwcmVzc2lvbkRlc2NyaXB0aW9uKCAnNXgnIClcclxuICAgICAgXSxcclxuICAgICAgY2Fyb3VzZWxDb250ZW50czogW1xyXG4gICAgICAgIHsgdHlwZUlEOiBDb2luVGVybVR5cGVJRC5YLCBtaW5pbXVtRGVjb21wb3NpdGlvbjogMSwgY3JlYXRpb25MaW1pdDogNyB9LFxyXG4gICAgICAgIHsgdHlwZUlEOiBDb2luVGVybVR5cGVJRC5YLCBtaW5pbXVtRGVjb21wb3NpdGlvbjogMiwgY3JlYXRpb25MaW1pdDogMiB9LFxyXG4gICAgICAgIHsgdHlwZUlEOiBDb2luVGVybVR5cGVJRC5YLCBtaW5pbXVtRGVjb21wb3NpdGlvbjogNCwgY3JlYXRpb25MaW1pdDogMSB9XHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGV4cHJlc3Npb25zVG9Db2xsZWN0OiBbXHJcbiAgICAgICAgbmV3IEV4cHJlc3Npb25EZXNjcmlwdGlvbiggJzR4JyApLFxyXG4gICAgICAgIG5ldyBFeHByZXNzaW9uRGVzY3JpcHRpb24oICc0eCcgKSxcclxuICAgICAgICBuZXcgRXhwcmVzc2lvbkRlc2NyaXB0aW9uKCAnNHgnIClcclxuICAgICAgXSxcclxuICAgICAgY2Fyb3VzZWxDb250ZW50czogW1xyXG4gICAgICAgIHsgdHlwZUlEOiBDb2luVGVybVR5cGVJRC5YLCBtaW5pbXVtRGVjb21wb3NpdGlvbjogMSwgY3JlYXRpb25MaW1pdDogNSB9LFxyXG4gICAgICAgIHsgdHlwZUlEOiBDb2luVGVybVR5cGVJRC5YLCBtaW5pbXVtRGVjb21wb3NpdGlvbjogMiwgY3JlYXRpb25MaW1pdDogMiB9LFxyXG4gICAgICAgIHsgdHlwZUlEOiBDb2luVGVybVR5cGVJRC5YLCBtaW5pbXVtRGVjb21wb3NpdGlvbjogMywgY3JlYXRpb25MaW1pdDogMSB9XHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGV4cHJlc3Npb25zVG9Db2xsZWN0OiBbXHJcbiAgICAgICAgbmV3IEV4cHJlc3Npb25EZXNjcmlwdGlvbiggJzV5JyApLFxyXG4gICAgICAgIG5ldyBFeHByZXNzaW9uRGVzY3JpcHRpb24oICc1eScgKSxcclxuICAgICAgICBuZXcgRXhwcmVzc2lvbkRlc2NyaXB0aW9uKCAnNXknIClcclxuICAgICAgXSxcclxuICAgICAgY2Fyb3VzZWxDb250ZW50czogW1xyXG4gICAgICAgIHsgdHlwZUlEOiBDb2luVGVybVR5cGVJRC5ZLCBtaW5pbXVtRGVjb21wb3NpdGlvbjogMSwgY3JlYXRpb25MaW1pdDogMyB9LFxyXG4gICAgICAgIHsgdHlwZUlEOiBDb2luVGVybVR5cGVJRC5ZLCBtaW5pbXVtRGVjb21wb3NpdGlvbjogMiwgY3JlYXRpb25MaW1pdDogMyB9LFxyXG4gICAgICAgIHsgdHlwZUlEOiBDb2luVGVybVR5cGVJRC5ZLCBtaW5pbXVtRGVjb21wb3NpdGlvbjogMywgY3JlYXRpb25MaW1pdDogMiB9XHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGV4cHJlc3Npb25zVG9Db2xsZWN0OiBbXHJcbiAgICAgICAgbmV3IEV4cHJlc3Npb25EZXNjcmlwdGlvbiggJzZ5JyApLFxyXG4gICAgICAgIG5ldyBFeHByZXNzaW9uRGVzY3JpcHRpb24oICc2eScgKSxcclxuICAgICAgICBuZXcgRXhwcmVzc2lvbkRlc2NyaXB0aW9uKCAnNnknIClcclxuICAgICAgXSxcclxuICAgICAgY2Fyb3VzZWxDb250ZW50czogW1xyXG4gICAgICAgIHsgdHlwZUlEOiBDb2luVGVybVR5cGVJRC5ZLCBtaW5pbXVtRGVjb21wb3NpdGlvbjogMSwgY3JlYXRpb25MaW1pdDogNSB9LFxyXG4gICAgICAgIHsgdHlwZUlEOiBDb2luVGVybVR5cGVJRC5ZLCBtaW5pbXVtRGVjb21wb3NpdGlvbjogMywgY3JlYXRpb25MaW1pdDogMyB9LFxyXG4gICAgICAgIHsgdHlwZUlEOiBDb2luVGVybVR5cGVJRC5ZLCBtaW5pbXVtRGVjb21wb3NpdGlvbjogNCwgY3JlYXRpb25MaW1pdDogMSB9XHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGV4cHJlc3Npb25zVG9Db2xsZWN0OiBbXHJcbiAgICAgICAgbmV3IEV4cHJlc3Npb25EZXNjcmlwdGlvbiggJzV6JyApLFxyXG4gICAgICAgIG5ldyBFeHByZXNzaW9uRGVzY3JpcHRpb24oICc1eicgKSxcclxuICAgICAgICBuZXcgRXhwcmVzc2lvbkRlc2NyaXB0aW9uKCAnNXonIClcclxuICAgICAgXSxcclxuICAgICAgY2Fyb3VzZWxDb250ZW50czogW1xyXG4gICAgICAgIHsgdHlwZUlEOiBDb2luVGVybVR5cGVJRC5aLCBtaW5pbXVtRGVjb21wb3NpdGlvbjogMSwgY3JlYXRpb25MaW1pdDogOCB9LFxyXG4gICAgICAgIHsgdHlwZUlEOiBDb2luVGVybVR5cGVJRC5aLCBtaW5pbXVtRGVjb21wb3NpdGlvbjogMywgY3JlYXRpb25MaW1pdDogMSB9LFxyXG4gICAgICAgIHsgdHlwZUlEOiBDb2luVGVybVR5cGVJRC5aLCBtaW5pbXVtRGVjb21wb3NpdGlvbjogNCwgY3JlYXRpb25MaW1pdDogMSB9XHJcbiAgICAgIF1cclxuICAgIH1cclxuICBdLFxyXG5cclxuICAvLyBsZXZlbCA0XHJcbiAgW1xyXG4gICAge1xyXG4gICAgICBleHByZXNzaW9uc1RvQ29sbGVjdDogW1xyXG4gICAgICAgIG5ldyBFeHByZXNzaW9uRGVzY3JpcHRpb24oICczeCcgKSxcclxuICAgICAgICBuZXcgRXhwcmVzc2lvbkRlc2NyaXB0aW9uKCAnMnggKyB4XjInICksXHJcbiAgICAgICAgbmV3IEV4cHJlc3Npb25EZXNjcmlwdGlvbiggJ3ggKyAyeF4yJyApXHJcbiAgICAgIF0sXHJcbiAgICAgIGNhcm91c2VsQ29udGVudHM6IFtcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuWCwgbWluaW11bURlY29tcG9zaXRpb246IDEsIGNyZWF0aW9uTGltaXQ6IDIgfSxcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuWCwgbWluaW11bURlY29tcG9zaXRpb246IDIsIGNyZWF0aW9uTGltaXQ6IDIgfSxcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuWF9TUVVBUkVELCBtaW5pbXVtRGVjb21wb3NpdGlvbjogMSwgY3JlYXRpb25MaW1pdDogMyB9XHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGV4cHJlc3Npb25zVG9Db2xsZWN0OiBbXHJcbiAgICAgICAgbmV3IEV4cHJlc3Npb25EZXNjcmlwdGlvbiggJ3ggKyB5JyApLFxyXG4gICAgICAgIG5ldyBFeHByZXNzaW9uRGVzY3JpcHRpb24oICcyeCArIDJ5JyApLFxyXG4gICAgICAgIG5ldyBFeHByZXNzaW9uRGVzY3JpcHRpb24oICd4ICsgM3knIClcclxuICAgICAgXSxcclxuICAgICAgY2Fyb3VzZWxDb250ZW50czogW1xyXG4gICAgICAgIHsgdHlwZUlEOiBDb2luVGVybVR5cGVJRC5YLCBtaW5pbXVtRGVjb21wb3NpdGlvbjogMSwgY3JlYXRpb25MaW1pdDogNCB9LFxyXG4gICAgICAgIHsgdHlwZUlEOiBDb2luVGVybVR5cGVJRC5ZLCBtaW5pbXVtRGVjb21wb3NpdGlvbjogMSwgY3JlYXRpb25MaW1pdDogMiB9LFxyXG4gICAgICAgIHsgdHlwZUlEOiBDb2luVGVybVR5cGVJRC5ZLCBtaW5pbXVtRGVjb21wb3NpdGlvbjogMiwgY3JlYXRpb25MaW1pdDogMiB9XHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGV4cHJlc3Npb25zVG9Db2xsZWN0OiBbXHJcbiAgICAgICAgbmV3IEV4cHJlc3Npb25EZXNjcmlwdGlvbiggJzJ4ICsgMnonICksXHJcbiAgICAgICAgbmV3IEV4cHJlc3Npb25EZXNjcmlwdGlvbiggJzN4ICsgM3knICksXHJcbiAgICAgICAgbmV3IEV4cHJlc3Npb25EZXNjcmlwdGlvbiggJzN5ICsgMnonIClcclxuICAgICAgXSxcclxuICAgICAgY2Fyb3VzZWxDb250ZW50czogW1xyXG4gICAgICAgIHsgdHlwZUlEOiBDb2luVGVybVR5cGVJRC5YLCBtaW5pbXVtRGVjb21wb3NpdGlvbjogMSwgY3JlYXRpb25MaW1pdDogMSB9LFxyXG4gICAgICAgIHsgdHlwZUlEOiBDb2luVGVybVR5cGVJRC5YLCBtaW5pbXVtRGVjb21wb3NpdGlvbjogMiwgY3JlYXRpb25MaW1pdDogMiB9LFxyXG4gICAgICAgIHsgdHlwZUlEOiBDb2luVGVybVR5cGVJRC5ZLCBtaW5pbXVtRGVjb21wb3NpdGlvbjogMywgY3JlYXRpb25MaW1pdDogMiB9LFxyXG4gICAgICAgIHsgdHlwZUlEOiBDb2luVGVybVR5cGVJRC5aLCBtaW5pbXVtRGVjb21wb3NpdGlvbjogMiwgY3JlYXRpb25MaW1pdDogMiB9XHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGV4cHJlc3Npb25zVG9Db2xsZWN0OiBbXHJcbiAgICAgICAgbmV3IEV4cHJlc3Npb25EZXNjcmlwdGlvbiggJzR5ICsgNHonICksXHJcbiAgICAgICAgbmV3IEV4cHJlc3Npb25EZXNjcmlwdGlvbiggJzJ5ICsgeicgKSxcclxuICAgICAgICBuZXcgRXhwcmVzc2lvbkRlc2NyaXB0aW9uKCAneSArIDN6JyApXHJcbiAgICAgIF0sXHJcbiAgICAgIGNhcm91c2VsQ29udGVudHM6IFtcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuWSwgbWluaW11bURlY29tcG9zaXRpb246IDEsIGNyZWF0aW9uTGltaXQ6IDEgfSxcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuWSwgbWluaW11bURlY29tcG9zaXRpb246IDIsIGNyZWF0aW9uTGltaXQ6IDMgfSxcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuWiwgbWluaW11bURlY29tcG9zaXRpb246IDEsIGNyZWF0aW9uTGltaXQ6IDIgfSxcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuWiwgbWluaW11bURlY29tcG9zaXRpb246IDIsIGNyZWF0aW9uTGltaXQ6IDMgfVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBleHByZXNzaW9uc1RvQ29sbGVjdDogW1xyXG4gICAgICAgIG5ldyBFeHByZXNzaW9uRGVzY3JpcHRpb24oICc0eScgKSxcclxuICAgICAgICBuZXcgRXhwcmVzc2lvbkRlc2NyaXB0aW9uKCAneSArIDJ5XjInICksXHJcbiAgICAgICAgbmV3IEV4cHJlc3Npb25EZXNjcmlwdGlvbiggJzJ5ICsgMnleMicgKVxyXG4gICAgICBdLFxyXG4gICAgICBjYXJvdXNlbENvbnRlbnRzOiBbXHJcbiAgICAgICAgeyB0eXBlSUQ6IENvaW5UZXJtVHlwZUlELlksIG1pbmltdW1EZWNvbXBvc2l0aW9uOiAxLCBjcmVhdGlvbkxpbWl0OiAzIH0sXHJcbiAgICAgICAgeyB0eXBlSUQ6IENvaW5UZXJtVHlwZUlELlksIG1pbmltdW1EZWNvbXBvc2l0aW9uOiAyLCBjcmVhdGlvbkxpbWl0OiAyIH0sXHJcbiAgICAgICAgeyB0eXBlSUQ6IENvaW5UZXJtVHlwZUlELllfU1FVQVJFRCwgbWluaW11bURlY29tcG9zaXRpb246IDEsIGNyZWF0aW9uTGltaXQ6IDIgfSxcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuWV9TUVVBUkVELCBtaW5pbXVtRGVjb21wb3NpdGlvbjogMiwgY3JlYXRpb25MaW1pdDogMSB9XHJcbiAgICAgIF1cclxuICAgIH1cclxuICBdLFxyXG5cclxuICAvLyBsZXZlbCA1XHJcbiAgW1xyXG4gICAge1xyXG4gICAgICBleHByZXNzaW9uc1RvQ29sbGVjdDogW1xyXG4gICAgICAgIG5ldyBFeHByZXNzaW9uRGVzY3JpcHRpb24oICcyeCAtIDMnICksXHJcbiAgICAgICAgbmV3IEV4cHJlc3Npb25EZXNjcmlwdGlvbiggJ3ggLSAyJyApLFxyXG4gICAgICAgIG5ldyBFeHByZXNzaW9uRGVzY3JpcHRpb24oICcteCArIDInIClcclxuICAgICAgXSxcclxuICAgICAgY2Fyb3VzZWxDb250ZW50czogW1xyXG4gICAgICAgIHsgdHlwZUlEOiBDb2luVGVybVR5cGVJRC5YLCBtaW5pbXVtRGVjb21wb3NpdGlvbjogMiwgY3JlYXRpb25MaW1pdDogMiB9LFxyXG4gICAgICAgIHsgdHlwZUlEOiBDb2luVGVybVR5cGVJRC5YLCBtaW5pbXVtRGVjb21wb3NpdGlvbjogLTEsIGNyZWF0aW9uTGltaXQ6IDIgfSxcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuQ09OU1RBTlQsIG1pbmltdW1EZWNvbXBvc2l0aW9uOiAxLCBjcmVhdGlvbkxpbWl0OiAyIH0sXHJcbiAgICAgICAgeyB0eXBlSUQ6IENvaW5UZXJtVHlwZUlELkNPTlNUQU5ULCBtaW5pbXVtRGVjb21wb3NpdGlvbjogLTEsIGNyZWF0aW9uTGltaXQ6IDUgfVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBleHByZXNzaW9uc1RvQ29sbGVjdDogW1xyXG4gICAgICAgIG5ldyBFeHByZXNzaW9uRGVzY3JpcHRpb24oICc1eF4yICsgeScgKSxcclxuICAgICAgICBuZXcgRXhwcmVzc2lvbkRlc2NyaXB0aW9uKCAnNHheMiAtIDJ5JyApLFxyXG4gICAgICAgIG5ldyBFeHByZXNzaW9uRGVzY3JpcHRpb24oICczeF4yICsgNHknIClcclxuICAgICAgXSxcclxuICAgICAgY2Fyb3VzZWxDb250ZW50czogW1xyXG4gICAgICAgIHsgdHlwZUlEOiBDb2luVGVybVR5cGVJRC5YX1NRVUFSRUQsIG1pbmltdW1EZWNvbXBvc2l0aW9uOiAyLCBjcmVhdGlvbkxpbWl0OiAzIH0sXHJcbiAgICAgICAgeyB0eXBlSUQ6IENvaW5UZXJtVHlwZUlELlhfU1FVQVJFRCwgbWluaW11bURlY29tcG9zaXRpb246IDMsIGNyZWF0aW9uTGltaXQ6IDIgfSxcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuWSwgbWluaW11bURlY29tcG9zaXRpb246IDIsIGNyZWF0aW9uTGltaXQ6IDMgfSxcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuWSwgbWluaW11bURlY29tcG9zaXRpb246IC0xLCBjcmVhdGlvbkxpbWl0OiAzIH1cclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgZXhwcmVzc2lvbnNUb0NvbGxlY3Q6IFtcclxuICAgICAgICBuZXcgRXhwcmVzc2lvbkRlc2NyaXB0aW9uKCAneSAtIDJ4JyApLFxyXG4gICAgICAgIG5ldyBFeHByZXNzaW9uRGVzY3JpcHRpb24oICcyeHknICksXHJcbiAgICAgICAgbmV3IEV4cHJlc3Npb25EZXNjcmlwdGlvbiggJzN4ICsgMnknIClcclxuICAgICAgXSxcclxuICAgICAgY2Fyb3VzZWxDb250ZW50czogW1xyXG4gICAgICAgIHsgdHlwZUlEOiBDb2luVGVybVR5cGVJRC5YLCBtaW5pbXVtRGVjb21wb3NpdGlvbjogMSwgY3JlYXRpb25MaW1pdDogMyB9LFxyXG4gICAgICAgIHsgdHlwZUlEOiBDb2luVGVybVR5cGVJRC5YLCBtaW5pbXVtRGVjb21wb3NpdGlvbjogLTIsIGNyZWF0aW9uTGltaXQ6IDEgfSxcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuWSwgbWluaW11bURlY29tcG9zaXRpb246IDEsIGNyZWF0aW9uTGltaXQ6IDMgfSxcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuWF9USU1FU19ZLCBtaW5pbXVtRGVjb21wb3NpdGlvbjogMSwgY3JlYXRpb25MaW1pdDogMiB9XHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGV4cHJlc3Npb25zVG9Db2xsZWN0OiBbXHJcbiAgICAgICAgbmV3IEV4cHJlc3Npb25EZXNjcmlwdGlvbiggJy15ICsgMnh5JyApLFxyXG4gICAgICAgIG5ldyBFeHByZXNzaW9uRGVzY3JpcHRpb24oICcyeSArIHh5JyApLFxyXG4gICAgICAgIG5ldyBFeHByZXNzaW9uRGVzY3JpcHRpb24oICcyeHkgLSAzeScgKVxyXG4gICAgICBdLFxyXG4gICAgICBjYXJvdXNlbENvbnRlbnRzOiBbXHJcbiAgICAgICAgeyB0eXBlSUQ6IENvaW5UZXJtVHlwZUlELlksIG1pbmltdW1EZWNvbXBvc2l0aW9uOiAxLCBjcmVhdGlvbkxpbWl0OiAyIH0sXHJcbiAgICAgICAgeyB0eXBlSUQ6IENvaW5UZXJtVHlwZUlELlksIG1pbmltdW1EZWNvbXBvc2l0aW9uOiAtMSwgY3JlYXRpb25MaW1pdDogNCB9LFxyXG4gICAgICAgIHsgdHlwZUlEOiBDb2luVGVybVR5cGVJRC5YX1RJTUVTX1ksIG1pbmltdW1EZWNvbXBvc2l0aW9uOiAxLCBjcmVhdGlvbkxpbWl0OiA1IH1cclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgZXhwcmVzc2lvbnNUb0NvbGxlY3Q6IFtcclxuICAgICAgICBuZXcgRXhwcmVzc2lvbkRlc2NyaXB0aW9uKCAnMnleMiAtIDInICksXHJcbiAgICAgICAgbmV3IEV4cHJlc3Npb25EZXNjcmlwdGlvbiggJzIgLSAyeV4yJyApLFxyXG4gICAgICAgIG5ldyBFeHByZXNzaW9uRGVzY3JpcHRpb24oICcyeV4yICsgMicgKVxyXG4gICAgICBdLFxyXG4gICAgICBjYXJvdXNlbENvbnRlbnRzOiBbXHJcbiAgICAgICAgeyB0eXBlSUQ6IENvaW5UZXJtVHlwZUlELllfU1FVQVJFRCwgbWluaW11bURlY29tcG9zaXRpb246IDEsIGNyZWF0aW9uTGltaXQ6IDQgfSxcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuWV9TUVVBUkVELCBtaW5pbXVtRGVjb21wb3NpdGlvbjogLTEsIGNyZWF0aW9uTGltaXQ6IDIgfSxcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuQ09OU1RBTlQsIG1pbmltdW1EZWNvbXBvc2l0aW9uOiAxLCBjcmVhdGlvbkxpbWl0OiA0IH0sXHJcbiAgICAgICAgeyB0eXBlSUQ6IENvaW5UZXJtVHlwZUlELkNPTlNUQU5ULCBtaW5pbXVtRGVjb21wb3NpdGlvbjogLTEsIGNyZWF0aW9uTGltaXQ6IDIgfVxyXG4gICAgICBdXHJcbiAgICB9XHJcbiAgXSxcclxuXHJcbiAgLy8gbGV2ZWwgNlxyXG4gIFtcclxuICAgIHtcclxuICAgICAgZXhwcmVzc2lvbnNUb0NvbGxlY3Q6IFtcclxuICAgICAgICBuZXcgRXhwcmVzc2lvbkRlc2NyaXB0aW9uKCAnLTN4JyApLFxyXG4gICAgICAgIG5ldyBFeHByZXNzaW9uRGVzY3JpcHRpb24oICctM3gnICksXHJcbiAgICAgICAgbmV3IEV4cHJlc3Npb25EZXNjcmlwdGlvbiggJy0zeCcgKVxyXG4gICAgICBdLFxyXG4gICAgICBjYXJvdXNlbENvbnRlbnRzOiBbXHJcbiAgICAgICAgeyB0eXBlSUQ6IENvaW5UZXJtVHlwZUlELlgsIG1pbmltdW1EZWNvbXBvc2l0aW9uOiAtNCwgY3JlYXRpb25MaW1pdDogMSB9LFxyXG4gICAgICAgIHsgdHlwZUlEOiBDb2luVGVybVR5cGVJRC5YLCBtaW5pbXVtRGVjb21wb3NpdGlvbjogLTIsIGNyZWF0aW9uTGltaXQ6IDEgfSxcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuWCwgbWluaW11bURlY29tcG9zaXRpb246IC0xLCBjcmVhdGlvbkxpbWl0OiA0IH0sXHJcbiAgICAgICAgeyB0eXBlSUQ6IENvaW5UZXJtVHlwZUlELlgsIG1pbmltdW1EZWNvbXBvc2l0aW9uOiAxLCBjcmVhdGlvbkxpbWl0OiAxIH1cclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgZXhwcmVzc2lvbnNUb0NvbGxlY3Q6IFtcclxuICAgICAgICBuZXcgRXhwcmVzc2lvbkRlc2NyaXB0aW9uKCAnM3ggLSB5JyApLFxyXG4gICAgICAgIG5ldyBFeHByZXNzaW9uRGVzY3JpcHRpb24oICczeCAtIHknICksXHJcbiAgICAgICAgbmV3IEV4cHJlc3Npb25EZXNjcmlwdGlvbiggJzN4IC0geScgKVxyXG4gICAgICBdLFxyXG4gICAgICBjYXJvdXNlbENvbnRlbnRzOiBbXHJcbiAgICAgICAgeyB0eXBlSUQ6IENvaW5UZXJtVHlwZUlELlgsIG1pbmltdW1EZWNvbXBvc2l0aW9uOiAxLCBjcmVhdGlvbkxpbWl0OiA0IH0sXHJcbiAgICAgICAgeyB0eXBlSUQ6IENvaW5UZXJtVHlwZUlELlgsIG1pbmltdW1EZWNvbXBvc2l0aW9uOiAyLCBjcmVhdGlvbkxpbWl0OiAxIH0sXHJcbiAgICAgICAgeyB0eXBlSUQ6IENvaW5UZXJtVHlwZUlELlgsIG1pbmltdW1EZWNvbXBvc2l0aW9uOiAzLCBjcmVhdGlvbkxpbWl0OiAxIH0sXHJcbiAgICAgICAgeyB0eXBlSUQ6IENvaW5UZXJtVHlwZUlELlksIG1pbmltdW1EZWNvbXBvc2l0aW9uOiAtMSwgY3JlYXRpb25MaW1pdDogMyB9XHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGV4cHJlc3Npb25zVG9Db2xsZWN0OiBbXHJcbiAgICAgICAgbmV3IEV4cHJlc3Npb25EZXNjcmlwdGlvbiggJy01eicgKSxcclxuICAgICAgICBuZXcgRXhwcmVzc2lvbkRlc2NyaXB0aW9uKCAnLTV6JyApLFxyXG4gICAgICAgIG5ldyBFeHByZXNzaW9uRGVzY3JpcHRpb24oICctNXonIClcclxuICAgICAgXSxcclxuICAgICAgY2Fyb3VzZWxDb250ZW50czogW1xyXG4gICAgICAgIHsgdHlwZUlEOiBDb2luVGVybVR5cGVJRC5aLCBtaW5pbXVtRGVjb21wb3NpdGlvbjogLTEsIGNyZWF0aW9uTGltaXQ6IDcgfSxcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuWiwgbWluaW11bURlY29tcG9zaXRpb246IC0yLCBjcmVhdGlvbkxpbWl0OiAyIH0sXHJcbiAgICAgICAgeyB0eXBlSUQ6IENvaW5UZXJtVHlwZUlELlosIG1pbmltdW1EZWNvbXBvc2l0aW9uOiAtNCwgY3JlYXRpb25MaW1pdDogMSB9XHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGV4cHJlc3Npb25zVG9Db2xsZWN0OiBbXHJcbiAgICAgICAgbmV3IEV4cHJlc3Npb25EZXNjcmlwdGlvbiggJzN5IC0gMicgKSxcclxuICAgICAgICBuZXcgRXhwcmVzc2lvbkRlc2NyaXB0aW9uKCAnM3kgLSAyJyApLFxyXG4gICAgICAgIG5ldyBFeHByZXNzaW9uRGVzY3JpcHRpb24oICczeSAtIDInIClcclxuICAgICAgXSxcclxuICAgICAgY2Fyb3VzZWxDb250ZW50czogW1xyXG4gICAgICAgIHsgdHlwZUlEOiBDb2luVGVybVR5cGVJRC5ZLCBtaW5pbXVtRGVjb21wb3NpdGlvbjogMiwgY3JlYXRpb25MaW1pdDogNCB9LFxyXG4gICAgICAgIHsgdHlwZUlEOiBDb2luVGVybVR5cGVJRC5ZLCBtaW5pbXVtRGVjb21wb3NpdGlvbjogMSwgY3JlYXRpb25MaW1pdDogMiB9LFxyXG4gICAgICAgIHsgdHlwZUlEOiBDb2luVGVybVR5cGVJRC5ZLCBtaW5pbXVtRGVjb21wb3NpdGlvbjogLTEsIGNyZWF0aW9uTGltaXQ6IDEgfSxcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuQ09OU1RBTlQsIG1pbmltdW1EZWNvbXBvc2l0aW9uOiAtMiwgY3JlYXRpb25MaW1pdDogMyB9XHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGV4cHJlc3Npb25zVG9Db2xsZWN0OiBbXHJcbiAgICAgICAgbmV3IEV4cHJlc3Npb25EZXNjcmlwdGlvbiggJzR5IC0gMScgKSxcclxuICAgICAgICBuZXcgRXhwcmVzc2lvbkRlc2NyaXB0aW9uKCAnNHkgLSAxJyApLFxyXG4gICAgICAgIG5ldyBFeHByZXNzaW9uRGVzY3JpcHRpb24oICc0eSAtIDEnIClcclxuICAgICAgXSxcclxuICAgICAgY2Fyb3VzZWxDb250ZW50czogW1xyXG4gICAgICAgIHsgdHlwZUlEOiBDb2luVGVybVR5cGVJRC5ZLCBtaW5pbXVtRGVjb21wb3NpdGlvbjogMSwgY3JlYXRpb25MaW1pdDogNSB9LFxyXG4gICAgICAgIHsgdHlwZUlEOiBDb2luVGVybVR5cGVJRC5ZLCBtaW5pbXVtRGVjb21wb3NpdGlvbjogMiwgY3JlYXRpb25MaW1pdDogMiB9LFxyXG4gICAgICAgIHsgdHlwZUlEOiBDb2luVGVybVR5cGVJRC5ZLCBtaW5pbXVtRGVjb21wb3NpdGlvbjogMywgY3JlYXRpb25MaW1pdDogMSB9LFxyXG4gICAgICAgIHsgdHlwZUlEOiBDb2luVGVybVR5cGVJRC5DT05TVEFOVCwgbWluaW11bURlY29tcG9zaXRpb246IC0xLCBjcmVhdGlvbkxpbWl0OiAzIH1cclxuICAgICAgXVxyXG4gICAgfVxyXG4gIF0sXHJcblxyXG4gIC8vIGxldmVsIDdcclxuICBbXHJcbiAgICB7XHJcbiAgICAgIGV4cHJlc3Npb25zVG9Db2xsZWN0OiBbXHJcbiAgICAgICAgbmV3IEV4cHJlc3Npb25EZXNjcmlwdGlvbiggJzIoeCAtIDEpJyApLFxyXG4gICAgICAgIG5ldyBFeHByZXNzaW9uRGVzY3JpcHRpb24oICcxKDJ4IC0gMiknICksXHJcbiAgICAgICAgbmV3IEV4cHJlc3Npb25EZXNjcmlwdGlvbiggJzIoeCArIDMpJyApXHJcbiAgICAgIF0sXHJcbiAgICAgIGNhcm91c2VsQ29udGVudHM6IFtcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuWCwgbWluaW11bURlY29tcG9zaXRpb246IDEsIGNyZWF0aW9uTGltaXQ6IDQgfSxcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuWCwgbWluaW11bURlY29tcG9zaXRpb246IDIsIGNyZWF0aW9uTGltaXQ6IDEgfSxcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuQ09OU1RBTlQsIG1pbmltdW1EZWNvbXBvc2l0aW9uOiAxLCBjcmVhdGlvbkxpbWl0OiA2IH0sXHJcbiAgICAgICAgeyB0eXBlSUQ6IENvaW5UZXJtVHlwZUlELkNPTlNUQU5ULCBtaW5pbXVtRGVjb21wb3NpdGlvbjogLTEsIGNyZWF0aW9uTGltaXQ6IDQgfVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBleHByZXNzaW9uc1RvQ29sbGVjdDogW1xyXG4gICAgICAgIG5ldyBFeHByZXNzaW9uRGVzY3JpcHRpb24oICcyKDJ4ICsgeSknICksXHJcbiAgICAgICAgbmV3IEV4cHJlc3Npb25EZXNjcmlwdGlvbiggJzEoM3kgLSB4KScgKSxcclxuICAgICAgICBuZXcgRXhwcmVzc2lvbkRlc2NyaXB0aW9uKCAnMigyeCArIHkpJyApXHJcbiAgICAgIF0sXHJcbiAgICAgIGNhcm91c2VsQ29udGVudHM6IFtcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuWCwgbWluaW11bURlY29tcG9zaXRpb246IDEsIGNyZWF0aW9uTGltaXQ6IDQgfSxcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuWCwgbWluaW11bURlY29tcG9zaXRpb246IDIsIGNyZWF0aW9uTGltaXQ6IDIgfSxcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuWCwgbWluaW11bURlY29tcG9zaXRpb246IC0xLCBjcmVhdGlvbkxpbWl0OiAxIH0sXHJcbiAgICAgICAgeyB0eXBlSUQ6IENvaW5UZXJtVHlwZUlELlksIG1pbmltdW1EZWNvbXBvc2l0aW9uOiAxLCBjcmVhdGlvbkxpbWl0OiA3IH1cclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgZXhwcmVzc2lvbnNUb0NvbGxlY3Q6IFtcclxuICAgICAgICBuZXcgRXhwcmVzc2lvbkRlc2NyaXB0aW9uKCAnMih5ICsgMyknICksXHJcbiAgICAgICAgbmV3IEV4cHJlc3Npb25EZXNjcmlwdGlvbiggJzMoeSAtIDEpJyApLFxyXG4gICAgICAgIG5ldyBFeHByZXNzaW9uRGVzY3JpcHRpb24oICcyKDEgKyB5KScgKVxyXG4gICAgICBdLFxyXG4gICAgICBjYXJvdXNlbENvbnRlbnRzOiBbXHJcbiAgICAgICAgeyB0eXBlSUQ6IENvaW5UZXJtVHlwZUlELlksIG1pbmltdW1EZWNvbXBvc2l0aW9uOiAxLCBjcmVhdGlvbkxpbWl0OiA3IH0sXHJcbiAgICAgICAgeyB0eXBlSUQ6IENvaW5UZXJtVHlwZUlELkNPTlNUQU5ULCBtaW5pbXVtRGVjb21wb3NpdGlvbjogMSwgY3JlYXRpb25MaW1pdDogMiB9LFxyXG4gICAgICAgIHsgdHlwZUlEOiBDb2luVGVybVR5cGVJRC5DT05TVEFOVCwgbWluaW11bURlY29tcG9zaXRpb246IDMsIGNyZWF0aW9uTGltaXQ6IDIgfSxcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuQ09OU1RBTlQsIG1pbmltdW1EZWNvbXBvc2l0aW9uOiAtMSwgY3JlYXRpb25MaW1pdDogMyB9XHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGV4cHJlc3Npb25zVG9Db2xsZWN0OiBbXHJcbiAgICAgICAgbmV3IEV4cHJlc3Npb25EZXNjcmlwdGlvbiggJzEoM3kgLSB6KScgKSxcclxuICAgICAgICBuZXcgRXhwcmVzc2lvbkRlc2NyaXB0aW9uKCAnMih5ICsgMnopJyApLFxyXG4gICAgICAgIG5ldyBFeHByZXNzaW9uRGVzY3JpcHRpb24oICczKHkgLSB6KScgKVxyXG4gICAgICBdLFxyXG4gICAgICBjYXJvdXNlbENvbnRlbnRzOiBbXHJcbiAgICAgICAgeyB0eXBlSUQ6IENvaW5UZXJtVHlwZUlELlksIG1pbmltdW1EZWNvbXBvc2l0aW9uOiAxLCBjcmVhdGlvbkxpbWl0OiA1IH0sXHJcbiAgICAgICAgeyB0eXBlSUQ6IENvaW5UZXJtVHlwZUlELlksIG1pbmltdW1EZWNvbXBvc2l0aW9uOiAzLCBjcmVhdGlvbkxpbWl0OiAxIH0sXHJcbiAgICAgICAgeyB0eXBlSUQ6IENvaW5UZXJtVHlwZUlELlosIG1pbmltdW1EZWNvbXBvc2l0aW9uOiAyLCBjcmVhdGlvbkxpbWl0OiAyIH0sXHJcbiAgICAgICAgeyB0eXBlSUQ6IENvaW5UZXJtVHlwZUlELlosIG1pbmltdW1EZWNvbXBvc2l0aW9uOiAtMSwgY3JlYXRpb25MaW1pdDogNCB9XHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGV4cHJlc3Npb25zVG9Db2xsZWN0OiBbXHJcbiAgICAgICAgbmV3IEV4cHJlc3Npb25EZXNjcmlwdGlvbiggJzIoeCAtIDJ5KScgKSxcclxuICAgICAgICBuZXcgRXhwcmVzc2lvbkRlc2NyaXB0aW9uKCAnMyh4ICsgeSknICksXHJcbiAgICAgICAgbmV3IEV4cHJlc3Npb25EZXNjcmlwdGlvbiggJzIoMnggLSB5KScgKVxyXG4gICAgICBdLFxyXG4gICAgICBjYXJvdXNlbENvbnRlbnRzOiBbXHJcbiAgICAgICAgeyB0eXBlSUQ6IENvaW5UZXJtVHlwZUlELlgsIG1pbmltdW1EZWNvbXBvc2l0aW9uOiAxLCBjcmVhdGlvbkxpbWl0OiA1IH0sXHJcbiAgICAgICAgeyB0eXBlSUQ6IENvaW5UZXJtVHlwZUlELlgsIG1pbmltdW1EZWNvbXBvc2l0aW9uOiAyLCBjcmVhdGlvbkxpbWl0OiAyIH0sXHJcbiAgICAgICAgeyB0eXBlSUQ6IENvaW5UZXJtVHlwZUlELlksIG1pbmltdW1EZWNvbXBvc2l0aW9uOiAxLCBjcmVhdGlvbkxpbWl0OiAzIH0sXHJcbiAgICAgICAgeyB0eXBlSUQ6IENvaW5UZXJtVHlwZUlELlksIG1pbmltdW1EZWNvbXBvc2l0aW9uOiAtMSwgY3JlYXRpb25MaW1pdDogNiB9XHJcbiAgICAgIF1cclxuICAgIH1cclxuICBdLFxyXG5cclxuICAvLyBsZXZlbCA4XHJcbiAgW1xyXG4gICAge1xyXG4gICAgICBleHByZXNzaW9uc1RvQ29sbGVjdDogW1xyXG4gICAgICAgIG5ldyBFeHByZXNzaW9uRGVzY3JpcHRpb24oICd4KHggKyAxKSArIDEnICksXHJcbiAgICAgICAgbmV3IEV4cHJlc3Npb25EZXNjcmlwdGlvbiggJzMoeF4yICsgMSknICksXHJcbiAgICAgICAgbmV3IEV4cHJlc3Npb25EZXNjcmlwdGlvbiggJzIoeCAtIDIpJyApXHJcbiAgICAgIF0sXHJcbiAgICAgIGNhcm91c2VsQ29udGVudHM6IFtcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuQ09OU1RBTlQsIG1pbmltdW1EZWNvbXBvc2l0aW9uOiAxLCBjcmVhdGlvbkxpbWl0OiA1IH0sXHJcbiAgICAgICAgeyB0eXBlSUQ6IENvaW5UZXJtVHlwZUlELkNPTlNUQU5ULCBtaW5pbXVtRGVjb21wb3NpdGlvbjogLTEsIGNyZWF0aW9uTGltaXQ6IDUgfSxcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuWCwgbWluaW11bURlY29tcG9zaXRpb246IDEsIGNyZWF0aW9uTGltaXQ6IDQgfSxcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuWF9TUVVBUkVELCBtaW5pbXVtRGVjb21wb3NpdGlvbjogMSwgY3JlYXRpb25MaW1pdDogNCB9XHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGV4cHJlc3Npb25zVG9Db2xsZWN0OiBbXHJcbiAgICAgICAgbmV3IEV4cHJlc3Npb25EZXNjcmlwdGlvbiggJzJ4IC0gKHggKyAxKScgKSxcclxuICAgICAgICBuZXcgRXhwcmVzc2lvbkRlc2NyaXB0aW9uKCAneCArIDIoeCAtIDEpJyApLFxyXG4gICAgICAgIG5ldyBFeHByZXNzaW9uRGVzY3JpcHRpb24oICd4KHggKyAxKScgKVxyXG4gICAgICBdLFxyXG4gICAgICBjYXJvdXNlbENvbnRlbnRzOiBbXHJcbiAgICAgICAgeyB0eXBlSUQ6IENvaW5UZXJtVHlwZUlELlgsIG1pbmltdW1EZWNvbXBvc2l0aW9uOiAxLCBjcmVhdGlvbkxpbWl0OiA1IH0sXHJcbiAgICAgICAgeyB0eXBlSUQ6IENvaW5UZXJtVHlwZUlELlhfU1FVQVJFRCwgbWluaW11bURlY29tcG9zaXRpb246IDEsIGNyZWF0aW9uTGltaXQ6IDMgfSxcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuQ09OU1RBTlQsIG1pbmltdW1EZWNvbXBvc2l0aW9uOiAtMSwgY3JlYXRpb25MaW1pdDogMyB9LFxyXG4gICAgICAgIHsgdHlwZUlEOiBDb2luVGVybVR5cGVJRC5DT05TVEFOVCwgbWluaW11bURlY29tcG9zaXRpb246IDEsIGNyZWF0aW9uTGltaXQ6IDIgfVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBleHByZXNzaW9uc1RvQ29sbGVjdDogW1xyXG4gICAgICAgIG5ldyBFeHByZXNzaW9uRGVzY3JpcHRpb24oICctMSh4IC0gMiknICksXHJcbiAgICAgICAgbmV3IEV4cHJlc3Npb25EZXNjcmlwdGlvbiggJzMgKyB4KHggLSAyKScgKSxcclxuICAgICAgICBuZXcgRXhwcmVzc2lvbkRlc2NyaXB0aW9uKCAnMyh4XjIgKyAxKSAnIClcclxuICAgICAgXSxcclxuICAgICAgY2Fyb3VzZWxDb250ZW50czogW1xyXG4gICAgICAgIHsgdHlwZUlEOiBDb2luVGVybVR5cGVJRC5YLCBtaW5pbXVtRGVjb21wb3NpdGlvbjogLTEsIGNyZWF0aW9uTGltaXQ6IDMgfSxcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuWF9TUVVBUkVELCBtaW5pbXVtRGVjb21wb3NpdGlvbjogMSwgY3JlYXRpb25MaW1pdDogNCB9LFxyXG4gICAgICAgIHsgdHlwZUlEOiBDb2luVGVybVR5cGVJRC5DT05TVEFOVCwgbWluaW11bURlY29tcG9zaXRpb246IDEsIGNyZWF0aW9uTGltaXQ6IDggfSxcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuQ09OU1RBTlQsIG1pbmltdW1EZWNvbXBvc2l0aW9uOiAtMSwgY3JlYXRpb25MaW1pdDogMiB9XHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGV4cHJlc3Npb25zVG9Db2xsZWN0OiBbXHJcbiAgICAgICAgbmV3IEV4cHJlc3Npb25EZXNjcmlwdGlvbiggJy0yKHheMiAtIDEpJyApLFxyXG4gICAgICAgIG5ldyBFeHByZXNzaW9uRGVzY3JpcHRpb24oICczKHheMiArIHgpJyApLFxyXG4gICAgICAgIG5ldyBFeHByZXNzaW9uRGVzY3JpcHRpb24oICd4KHggKyAyKSArIDEnIClcclxuICAgICAgXSxcclxuICAgICAgY2Fyb3VzZWxDb250ZW50czogW1xyXG4gICAgICAgIHsgdHlwZUlEOiBDb2luVGVybVR5cGVJRC5DT05TVEFOVCwgbWluaW11bURlY29tcG9zaXRpb246IDEsIGNyZWF0aW9uTGltaXQ6IDMgfSxcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuWCwgbWluaW11bURlY29tcG9zaXRpb246IDEsIGNyZWF0aW9uTGltaXQ6IDUgfSxcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuWF9TUVVBUkVELCBtaW5pbXVtRGVjb21wb3NpdGlvbjogMSwgY3JlYXRpb25MaW1pdDogNiB9LFxyXG4gICAgICAgIHsgdHlwZUlEOiBDb2luVGVybVR5cGVJRC5YX1NRVUFSRUQsIG1pbmltdW1EZWNvbXBvc2l0aW9uOiAtMSwgY3JlYXRpb25MaW1pdDogMiB9XHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGV4cHJlc3Npb25zVG9Db2xsZWN0OiBbXHJcbiAgICAgICAgbmV3IEV4cHJlc3Npb25EZXNjcmlwdGlvbiggJ3ggLSAoeCArIDIpJyApLFxyXG4gICAgICAgIG5ldyBFeHByZXNzaW9uRGVzY3JpcHRpb24oICd4KDJ4ICsgMSknICksXHJcbiAgICAgICAgbmV3IEV4cHJlc3Npb25EZXNjcmlwdGlvbiggJzIoeF4yIC0gMSknIClcclxuICAgICAgXSxcclxuICAgICAgY2Fyb3VzZWxDb250ZW50czogWyB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuWCwgbWluaW11bURlY29tcG9zaXRpb246IDEsIGNyZWF0aW9uTGltaXQ6IDIgfSxcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuWCwgbWluaW11bURlY29tcG9zaXRpb246IC0xLCBjcmVhdGlvbkxpbWl0OiAzIH0sXHJcbiAgICAgICAgeyB0eXBlSUQ6IENvaW5UZXJtVHlwZUlELkNPTlNUQU5ULCBtaW5pbXVtRGVjb21wb3NpdGlvbjogLTEsIGNyZWF0aW9uTGltaXQ6IDQgfSxcclxuICAgICAgICB7IHR5cGVJRDogQ29pblRlcm1UeXBlSUQuWF9TUVVBUkVELCBtaW5pbXVtRGVjb21wb3NpdGlvbjogMSwgY3JlYXRpb25MaW1pdDogNCB9XHJcbiAgICAgIF1cclxuICAgIH1cclxuICBdXHJcbl07XHJcblxyXG4vKipcclxuICogc3RhdGljIG9iamVjdCB3aXRoIG1ldGhvZHMgZm9yIGFjY2Vzc2luZyB0aGUgY2hhbGxlbmdlIGRlc2NyaXB0b3JzIGRlZmluZWQgYWJvdmVcclxuICovXHJcbmNvbnN0IEVFQ2hhbGxlbmdlRGVzY3JpcHRvcnMgPSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIGdldCBhIGNoYWxsZW5nZSBkZXNjcmlwdG9yIGZvciB0aGUgc3BlY2lmaWVkIGxldmVsXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGxldmVsXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGNoYWxsZW5nZU51bWJlclxyXG4gICAqIEByZXR1cm5zIHtFRUNoYWxsZW5nZURlc2NyaXB0b3J9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldENoYWxsZW5nZURlc2NyaXB0b3IoIGxldmVsLCBjaGFsbGVuZ2VOdW1iZXIgKSB7XHJcbiAgICByZXR1cm4gY2hhbGxlbmdlU2V0c1sgbGV2ZWwgXVsgY2hhbGxlbmdlTnVtYmVyIF07XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogcmFuZG9taXplIHRoZSBjaGFsbGVuZ2Ugc2V0c1xyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzaHVmZmxlQ2hhbGxlbmdlcygpIHtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGNoYWxsZW5nZVNldHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNoYWxsZW5nZVNldHNbIGkgXSA9IGRvdFJhbmRvbS5zaHVmZmxlKCBjaGFsbGVuZ2VTZXRzWyBpIF0gKTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICAvL0BwdWJsaWNcclxuICBDSEFMTEVOR0VTX1BFUl9MRVZFTDogNVxyXG59O1xyXG5cclxuZXhwcmVzc2lvbkV4Y2hhbmdlLnJlZ2lzdGVyKCAnRUVDaGFsbGVuZ2VEZXNjcmlwdG9ycycsIEVFQ2hhbGxlbmdlRGVzY3JpcHRvcnMgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEVFQ2hhbGxlbmdlRGVzY3JpcHRvcnM7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFNBQVMsTUFBTSxpQ0FBaUM7QUFDdkQsT0FBT0MsY0FBYyxNQUFNLHFDQUFxQztBQUNoRSxPQUFPQyxrQkFBa0IsTUFBTSw2QkFBNkI7QUFDNUQsT0FBT0MscUJBQXFCLE1BQU0sNEJBQTRCOztBQUU5RDtBQUNBO0FBQ0E7QUFDQSxNQUFNQyxhQUFhLEdBQUc7QUFFcEI7QUFDQSxDQUNFO0VBQ0VDLG9CQUFvQixFQUFFLENBQ3BCLElBQUlGLHFCQUFxQixDQUFFLFFBQVMsQ0FBQyxFQUNyQyxJQUFJQSxxQkFBcUIsQ0FBRSxTQUFVLENBQUMsRUFD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
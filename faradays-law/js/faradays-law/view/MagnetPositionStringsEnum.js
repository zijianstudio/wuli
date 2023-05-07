// Copyright 2018-2022, University of Colorado Boulder

/**
 * Possible magnet region position strings.
 *
 * @author Michael Barlow (PhET Interactive Simulations)
 */

import faradaysLaw from '../../faradaysLaw.js';
import FaradaysLawStrings from '../../FaradaysLawStrings.js';

// strings
const topLeftString = FaradaysLawStrings.a11y.topLeft;
const topCenterString = FaradaysLawStrings.a11y.topCenter;
const topRightString = FaradaysLawStrings.a11y.topRight;
const middleLeftString = FaradaysLawStrings.a11y.middleLeft;
const centerString = FaradaysLawStrings.a11y.center;
const middleRightString = FaradaysLawStrings.a11y.middleRight;
const bottomLeftString = FaradaysLawStrings.a11y.bottomLeft;
const bottomCenterString = FaradaysLawStrings.a11y.bottomCenter;
const bottomRightString = FaradaysLawStrings.a11y.bottomRight;

const MagnetPositionStringsEnum = [
  topLeftString,
  topCenterString,
  topRightString,
  middleLeftString,
  centerString,
  middleRightString,
  bottomLeftString,
  bottomCenterString,
  bottomRightString
];

if ( assert ) { Object.feeze( MagnetPositionStringsEnum ); }

faradaysLaw.register( 'MagnetPositionStringsEnum', MagnetPositionStringsEnum );
export default MagnetPositionStringsEnum;

// Copyright 2018-2020, University of Colorado Boulder

/**
 * Unit tests for balloons-and-static-electricity.
 *
 * @author Michael Barlow (PhET Interactive Simulations)
 */

import qunitStart from '../../chipper/js/sim-tests/qunitStart.js';
import '../../scenery/js/util/Trail.js'; // Why is Trail not added to scenery namespace for these tests??
import './faradays-law/view/MagnetRegionsTests.js';

// Since our tests are loaded asynchronously, we must direct QUnit to begin the tests
qunitStart();
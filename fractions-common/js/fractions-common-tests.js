// Copyright 2018-2022, University of Colorado Boulder

/**
 * Unit tests. Please run once in phet brand.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import qunitStart from '../../chipper/js/sim-tests/qunitStart.js';
import './common/model/PrimeFactorizationTests.js';
import './common/model/PrimesTests.js';
import './game/model/CollectionFinderTests.js';

// Since our tests are loaded asynchronously, we must direct QUnit to begin the tests
qunitStart();
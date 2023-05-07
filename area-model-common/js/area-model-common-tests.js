// Copyright 2018-2022, University of Colorado Boulder

/**
 * Unit tests for area-model-common. Please run once in phet brand and once in brand=phet-io to cover all functionality.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import qunitStart from '../../chipper/js/sim-tests/qunitStart.js';
import './common/model/PolynomialTests.js';
import './common/model/TermListTests.js';
import './common/model/TermTests.js';

// Since our tests are loaded asynchronously, we must direct QUnit to begin the tests
qunitStart();
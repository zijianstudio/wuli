// Copyright 2022-2023, University of Colorado Boulder

/**
 * The 3 possible states of grouping + linking in a countingArea
 *
 * @author Chris Klusendorf
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';

class GroupAndLinkType extends EnumerationValue {
  public static readonly UNGROUPED = new GroupAndLinkType();
  public static readonly GROUPED = new GroupAndLinkType();
  public static readonly GROUPED_AND_LINKED = new GroupAndLinkType();

  public static readonly enumeration = new Enumeration( GroupAndLinkType );
}

numberSuiteCommon.register( 'GroupAndLinkType', GroupAndLinkType );
export default GroupAndLinkType;
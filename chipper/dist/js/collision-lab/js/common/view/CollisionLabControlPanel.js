// Copyright 2019-2023, University of Colorado Boulder

/**
 * Control Panel at the upper-right corner of each screen that allows the user to manipulate certain Properties of
 * the simulation.
 *
 * All screens have a control-panel in the same location with similar components. However, some components vary for
 * specific screens. This includes (which appear in some screens, not in other screens):
 *    - Elasticity Number Control
 *    - stick vs slip ABSwitch
 *    - change in momentum Checkbox
 *    - path Checkbox
 *    - reflecting border Checkbox
 *
 * Since many screens have similar control-panels, this was implemented to work generally for all screens, but can be
 * subclassed to add extra components that are specific to a screen. It also contains an options API to un-include
 * components that are normally common to all screens.
 *
 * @author Brandon Li
 * @author Alex Schor
 */

import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import { Color, HSeparator, VBox } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabStrings from '../../CollisionLabStrings.js';
import CollisionLabConstants from '../CollisionLabConstants.js';
import CollisionLabCheckbox from './CollisionLabCheckbox.js';
import CollisionLabIconFactory from './CollisionLabIconFactory.js';
import CollisionLabViewProperties from './CollisionLabViewProperties.js';
import ElasticityNumberControl from './ElasticityNumberControl.js';
class CollisionLabControlPanel extends Panel {
  /**
   * @param {CollisionLabViewProperties} viewProperties
   * @param {Property.<boolean>} centerOfMassVisibleProperty
   * @param {Property.<boolean>} pathsVisibleProperty
   * @param {Property.<boolean>} reflectingBorderProperty
   * @param {Property.<number>} elasticityPercentProperty
   * @param {Property.<boolean>} ballsConstantSizeProperty
   * @param {Object} [options]
   */
  constructor(viewProperties, centerOfMassVisibleProperty, pathsVisibleProperty, reflectingBorderProperty, elasticityPercentProperty, ballsConstantSizeProperty, options) {
    assert && assert(viewProperties instanceof CollisionLabViewProperties, `invalid viewProperties: ${viewProperties}`);
    assert && AssertUtils.assertPropertyOf(centerOfMassVisibleProperty, 'boolean');
    assert && AssertUtils.assertPropertyOf(pathsVisibleProperty, 'boolean');
    assert && AssertUtils.assertPropertyOf(reflectingBorderProperty, 'boolean');
    assert && AssertUtils.assertPropertyOf(elasticityPercentProperty, 'number');
    assert && AssertUtils.assertPropertyOf(ballsConstantSizeProperty, 'boolean');
    options = merge({}, CollisionLabConstants.PANEL_OPTIONS, {
      // {number} - the spacing between the content Nodes of the Panel
      contentSpacing: 7,
      // {boolean} - indicates if the reflecting border checkbox is included.
      includeReflectingBorderCheckbox: true,
      // {boolean} - indicates if the 'Path' checkbox is included.
      includePathCheckbox: true,
      // {boolean} - indicates if the 'Elasticity' NumberControl is included.
      includeElasticityNumberControl: true,
      // {Object} - passed to the ElasticityNumberControl, if it is included.
      elasticityNumberControlOptions: null
    }, options);

    // Make the panel a fixed width.
    assert && assert(options.minWidth === undefined, 'CollisionLabControlPanel sets minWidth');
    assert && assert(options.maxWidth === undefined, 'CollisionLabControlPanel sets maxWidth');
    const panelWidth = CollisionLabConstants.CONTROL_PANEL_CONTENT_WIDTH + 2 * options.xMargin;
    options.minWidth = panelWidth;
    options.maxWidth = panelWidth;

    //----------------------------------------------------------------------------------------

    // Create the content Node of the Control Panel.
    const contentNode = new VBox({
      spacing: options.contentSpacing,
      align: 'left'
    });
    super(contentNode, options);

    // @protected {Node} - the content Node. This is referenced for layouting purposes in sub-classes.
    this.contentNode = contentNode;

    //----------------------------------------------------------------------------------------

    // 'Velocity' visibility Checkbox
    const velocityCheckbox = new CollisionLabCheckbox(viewProperties.velocityVectorVisibleProperty, CollisionLabStrings.velocity, {
      icon: CollisionLabIconFactory.createVelocityVectorIcon()
    });

    // 'Momentum' visibility Checkbox
    const momentumCheckbox = new CollisionLabCheckbox(viewProperties.momentumVectorVisibleProperty, CollisionLabStrings.momentum, {
      icon: CollisionLabIconFactory.createMomentumVectorIcon()
    });

    // @protected {Checkbox} - 'Center of Mass' visibility Checkbox. This is referenced for ordering in sub-classes.
    this.centerOfMassCheckbox = new CollisionLabCheckbox(centerOfMassVisibleProperty, CollisionLabStrings.centerOfMass, {
      icon: CollisionLabIconFactory.createCenterOfMassIcon()
    });

    // 'Kinetic Energy' visibility Checkbox
    const kineticEnergyCheckbox = new CollisionLabCheckbox(viewProperties.kineticEnergyVisibleProperty, CollisionLabStrings.kineticEnergy);

    // 'Values' visibility Checkbox. This is referenced for ordering in sub-classes.
    const valuesCheckbox = new CollisionLabCheckbox(viewProperties.valuesVisibleProperty, CollisionLabStrings.values);

    // @protected {Checkbox} - 'Constant Size' Checkbox. Exposed to sub-classes for layouting.
    this.constantSizeCheckbox = new CollisionLabCheckbox(ballsConstantSizeProperty, CollisionLabStrings.constantSize);
    const hSeparator = new HSeparator({
      stroke: Color.BLACK
    });

    //----------------------------------------------------------------------------------------

    // Set the children of the content in the correct order.
    contentNode.children = [velocityCheckbox, momentumCheckbox, this.centerOfMassCheckbox, kineticEnergyCheckbox, valuesCheckbox];

    // Add the reflecting border Checkbox if it is included.
    if (options.includeReflectingBorderCheckbox) {
      // 'Reflecting Border' Checkbox
      const reflectingBorderCheckbox = new CollisionLabCheckbox(reflectingBorderProperty, CollisionLabStrings.reflectingBorder);

      // Add the Reflecting Border Checkbox after the values Checkbox.
      contentNode.addChild(reflectingBorderCheckbox);
    }

    // Add the path Checkbox if it is included.
    if (options.includePathCheckbox) {
      // Create the 'Path' visibility Checkbox.
      const pathCheckbox = new CollisionLabCheckbox(pathsVisibleProperty, CollisionLabStrings.path);

      // Add the 'Path' Checkbox after the 'Values' Checkbox.
      contentNode.addChild(pathCheckbox);
    }
    contentNode.addChild(hSeparator);

    // Add the 'Elasticity' NumberControl if it is included.
    if (options.includeElasticityNumberControl) {
      // 'Elasticity' Number Control
      const elasticityNumberControl = new ElasticityNumberControl(elasticityPercentProperty, options.elasticityNumberControlOptions);

      // Add the 'Elasticity' NumberControl after the horizontal line separator.
      contentNode.addChild(elasticityNumberControl);
    }
    contentNode.addChild(this.constantSizeCheckbox);

    // Apply additional Bounds mutators.
    this.mutate(options);
  }
}
collisionLab.register('CollisionLabControlPanel', CollisionLabControlPanel);
export default CollisionLabControlPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIkFzc2VydFV0aWxzIiwiQ29sb3IiLCJIU2VwYXJhdG9yIiwiVkJveCIsIlBhbmVsIiwiY29sbGlzaW9uTGFiIiwiQ29sbGlzaW9uTGFiU3RyaW5ncyIsIkNvbGxpc2lvbkxhYkNvbnN0YW50cyIsIkNvbGxpc2lvbkxhYkNoZWNrYm94IiwiQ29sbGlzaW9uTGFiSWNvbkZhY3RvcnkiLCJDb2xsaXNpb25MYWJWaWV3UHJvcGVydGllcyIsIkVsYXN0aWNpdHlOdW1iZXJDb250cm9sIiwiQ29sbGlzaW9uTGFiQ29udHJvbFBhbmVsIiwiY29uc3RydWN0b3IiLCJ2aWV3UHJvcGVydGllcyIsImNlbnRlck9mTWFzc1Zpc2libGVQcm9wZXJ0eSIsInBhdGhzVmlzaWJsZVByb3BlcnR5IiwicmVmbGVjdGluZ0JvcmRlclByb3BlcnR5IiwiZWxhc3RpY2l0eVBlcmNlbnRQcm9wZXJ0eSIsImJhbGxzQ29uc3RhbnRTaXplUHJvcGVydHkiLCJvcHRpb25zIiwiYXNzZXJ0IiwiYXNzZXJ0UHJvcGVydHlPZiIsIlBBTkVMX09QVElPTlMiLCJjb250ZW50U3BhY2luZyIsImluY2x1ZGVSZWZsZWN0aW5nQm9yZGVyQ2hlY2tib3giLCJpbmNsdWRlUGF0aENoZWNrYm94IiwiaW5jbHVkZUVsYXN0aWNpdHlOdW1iZXJDb250cm9sIiwiZWxhc3RpY2l0eU51bWJlckNvbnRyb2xPcHRpb25zIiwibWluV2lkdGgiLCJ1bmRlZmluZWQiLCJtYXhXaWR0aCIsInBhbmVsV2lkdGgiLCJDT05UUk9MX1BBTkVMX0NPTlRFTlRfV0lEVEgiLCJ4TWFyZ2luIiwiY29udGVudE5vZGUiLCJzcGFjaW5nIiwiYWxpZ24iLCJ2ZWxvY2l0eUNoZWNrYm94IiwidmVsb2NpdHlWZWN0b3JWaXNpYmxlUHJvcGVydHkiLCJ2ZWxvY2l0eSIsImljb24iLCJjcmVhdGVWZWxvY2l0eVZlY3Rvckljb24iLCJtb21lbnR1bUNoZWNrYm94IiwibW9tZW50dW1WZWN0b3JWaXNpYmxlUHJvcGVydHkiLCJtb21lbnR1bSIsImNyZWF0ZU1vbWVudHVtVmVjdG9ySWNvbiIsImNlbnRlck9mTWFzc0NoZWNrYm94IiwiY2VudGVyT2ZNYXNzIiwiY3JlYXRlQ2VudGVyT2ZNYXNzSWNvbiIsImtpbmV0aWNFbmVyZ3lDaGVja2JveCIsImtpbmV0aWNFbmVyZ3lWaXNpYmxlUHJvcGVydHkiLCJraW5ldGljRW5lcmd5IiwidmFsdWVzQ2hlY2tib3giLCJ2YWx1ZXNWaXNpYmxlUHJvcGVydHkiLCJ2YWx1ZXMiLCJjb25zdGFudFNpemVDaGVja2JveCIsImNvbnN0YW50U2l6ZSIsImhTZXBhcmF0b3IiLCJzdHJva2UiLCJCTEFDSyIsImNoaWxkcmVuIiwicmVmbGVjdGluZ0JvcmRlckNoZWNrYm94IiwicmVmbGVjdGluZ0JvcmRlciIsImFkZENoaWxkIiwicGF0aENoZWNrYm94IiwicGF0aCIsImVsYXN0aWNpdHlOdW1iZXJDb250cm9sIiwibXV0YXRlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJDb2xsaXNpb25MYWJDb250cm9sUGFuZWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQ29udHJvbCBQYW5lbCBhdCB0aGUgdXBwZXItcmlnaHQgY29ybmVyIG9mIGVhY2ggc2NyZWVuIHRoYXQgYWxsb3dzIHRoZSB1c2VyIHRvIG1hbmlwdWxhdGUgY2VydGFpbiBQcm9wZXJ0aWVzIG9mXHJcbiAqIHRoZSBzaW11bGF0aW9uLlxyXG4gKlxyXG4gKiBBbGwgc2NyZWVucyBoYXZlIGEgY29udHJvbC1wYW5lbCBpbiB0aGUgc2FtZSBsb2NhdGlvbiB3aXRoIHNpbWlsYXIgY29tcG9uZW50cy4gSG93ZXZlciwgc29tZSBjb21wb25lbnRzIHZhcnkgZm9yXHJcbiAqIHNwZWNpZmljIHNjcmVlbnMuIFRoaXMgaW5jbHVkZXMgKHdoaWNoIGFwcGVhciBpbiBzb21lIHNjcmVlbnMsIG5vdCBpbiBvdGhlciBzY3JlZW5zKTpcclxuICogICAgLSBFbGFzdGljaXR5IE51bWJlciBDb250cm9sXHJcbiAqICAgIC0gc3RpY2sgdnMgc2xpcCBBQlN3aXRjaFxyXG4gKiAgICAtIGNoYW5nZSBpbiBtb21lbnR1bSBDaGVja2JveFxyXG4gKiAgICAtIHBhdGggQ2hlY2tib3hcclxuICogICAgLSByZWZsZWN0aW5nIGJvcmRlciBDaGVja2JveFxyXG4gKlxyXG4gKiBTaW5jZSBtYW55IHNjcmVlbnMgaGF2ZSBzaW1pbGFyIGNvbnRyb2wtcGFuZWxzLCB0aGlzIHdhcyBpbXBsZW1lbnRlZCB0byB3b3JrIGdlbmVyYWxseSBmb3IgYWxsIHNjcmVlbnMsIGJ1dCBjYW4gYmVcclxuICogc3ViY2xhc3NlZCB0byBhZGQgZXh0cmEgY29tcG9uZW50cyB0aGF0IGFyZSBzcGVjaWZpYyB0byBhIHNjcmVlbi4gSXQgYWxzbyBjb250YWlucyBhbiBvcHRpb25zIEFQSSB0byB1bi1pbmNsdWRlXHJcbiAqIGNvbXBvbmVudHMgdGhhdCBhcmUgbm9ybWFsbHkgY29tbW9uIHRvIGFsbCBzY3JlZW5zLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEJyYW5kb24gTGlcclxuICogQGF1dGhvciBBbGV4IFNjaG9yXHJcbiAqL1xyXG5cclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBBc3NlcnRVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL0Fzc2VydFV0aWxzLmpzJztcclxuaW1wb3J0IHsgQ29sb3IsIEhTZXBhcmF0b3IsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG4gIGltcG9ydCBQYW5lbCBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvUGFuZWwuanMnO1xyXG5pbXBvcnQgY29sbGlzaW9uTGFiIGZyb20gJy4uLy4uL2NvbGxpc2lvbkxhYi5qcyc7XHJcbmltcG9ydCBDb2xsaXNpb25MYWJTdHJpbmdzIGZyb20gJy4uLy4uL0NvbGxpc2lvbkxhYlN0cmluZ3MuanMnO1xyXG5pbXBvcnQgQ29sbGlzaW9uTGFiQ29uc3RhbnRzIGZyb20gJy4uL0NvbGxpc2lvbkxhYkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBDb2xsaXNpb25MYWJDaGVja2JveCBmcm9tICcuL0NvbGxpc2lvbkxhYkNoZWNrYm94LmpzJztcclxuaW1wb3J0IENvbGxpc2lvbkxhYkljb25GYWN0b3J5IGZyb20gJy4vQ29sbGlzaW9uTGFiSWNvbkZhY3RvcnkuanMnO1xyXG5pbXBvcnQgQ29sbGlzaW9uTGFiVmlld1Byb3BlcnRpZXMgZnJvbSAnLi9Db2xsaXNpb25MYWJWaWV3UHJvcGVydGllcy5qcyc7XHJcbmltcG9ydCBFbGFzdGljaXR5TnVtYmVyQ29udHJvbCBmcm9tICcuL0VsYXN0aWNpdHlOdW1iZXJDb250cm9sLmpzJztcclxuXHJcbmNsYXNzIENvbGxpc2lvbkxhYkNvbnRyb2xQYW5lbCBleHRlbmRzIFBhbmVsIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtDb2xsaXNpb25MYWJWaWV3UHJvcGVydGllc30gdmlld1Byb3BlcnRpZXNcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5Ljxib29sZWFuPn0gY2VudGVyT2ZNYXNzVmlzaWJsZVByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48Ym9vbGVhbj59IHBhdGhzVmlzaWJsZVByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48Ym9vbGVhbj59IHJlZmxlY3RpbmdCb3JkZXJQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPG51bWJlcj59IGVsYXN0aWNpdHlQZXJjZW50UHJvcGVydHlcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5Ljxib29sZWFuPn0gYmFsbHNDb25zdGFudFNpemVQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvciggdmlld1Byb3BlcnRpZXMsXHJcbiAgICAgICAgICAgICAgIGNlbnRlck9mTWFzc1Zpc2libGVQcm9wZXJ0eSxcclxuICAgICAgICAgICAgICAgcGF0aHNWaXNpYmxlUHJvcGVydHksXHJcbiAgICAgICAgICAgICAgIHJlZmxlY3RpbmdCb3JkZXJQcm9wZXJ0eSxcclxuICAgICAgICAgICAgICAgZWxhc3RpY2l0eVBlcmNlbnRQcm9wZXJ0eSxcclxuICAgICAgICAgICAgICAgYmFsbHNDb25zdGFudFNpemVQcm9wZXJ0eSxcclxuICAgICAgICAgICAgICAgb3B0aW9ucyApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHZpZXdQcm9wZXJ0aWVzIGluc3RhbmNlb2YgQ29sbGlzaW9uTGFiVmlld1Byb3BlcnRpZXMsIGBpbnZhbGlkIHZpZXdQcm9wZXJ0aWVzOiAke3ZpZXdQcm9wZXJ0aWVzfWAgKTtcclxuICAgIGFzc2VydCAmJiBBc3NlcnRVdGlscy5hc3NlcnRQcm9wZXJ0eU9mKCBjZW50ZXJPZk1hc3NWaXNpYmxlUHJvcGVydHksICdib29sZWFuJyApO1xyXG4gICAgYXNzZXJ0ICYmIEFzc2VydFV0aWxzLmFzc2VydFByb3BlcnR5T2YoIHBhdGhzVmlzaWJsZVByb3BlcnR5LCAnYm9vbGVhbicgKTtcclxuICAgIGFzc2VydCAmJiBBc3NlcnRVdGlscy5hc3NlcnRQcm9wZXJ0eU9mKCByZWZsZWN0aW5nQm9yZGVyUHJvcGVydHksICdib29sZWFuJyApO1xyXG4gICAgYXNzZXJ0ICYmIEFzc2VydFV0aWxzLmFzc2VydFByb3BlcnR5T2YoIGVsYXN0aWNpdHlQZXJjZW50UHJvcGVydHksICdudW1iZXInICk7XHJcbiAgICBhc3NlcnQgJiYgQXNzZXJ0VXRpbHMuYXNzZXJ0UHJvcGVydHlPZiggYmFsbHNDb25zdGFudFNpemVQcm9wZXJ0eSwgJ2Jvb2xlYW4nICk7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7fSwgQ29sbGlzaW9uTGFiQ29uc3RhbnRzLlBBTkVMX09QVElPTlMsIHtcclxuXHJcbiAgICAgIC8vIHtudW1iZXJ9IC0gdGhlIHNwYWNpbmcgYmV0d2VlbiB0aGUgY29udGVudCBOb2RlcyBvZiB0aGUgUGFuZWxcclxuICAgICAgY29udGVudFNwYWNpbmc6IDcsXHJcblxyXG4gICAgICAvLyB7Ym9vbGVhbn0gLSBpbmRpY2F0ZXMgaWYgdGhlIHJlZmxlY3RpbmcgYm9yZGVyIGNoZWNrYm94IGlzIGluY2x1ZGVkLlxyXG4gICAgICBpbmNsdWRlUmVmbGVjdGluZ0JvcmRlckNoZWNrYm94OiB0cnVlLFxyXG5cclxuICAgICAgLy8ge2Jvb2xlYW59IC0gaW5kaWNhdGVzIGlmIHRoZSAnUGF0aCcgY2hlY2tib3ggaXMgaW5jbHVkZWQuXHJcbiAgICAgIGluY2x1ZGVQYXRoQ2hlY2tib3g6IHRydWUsXHJcblxyXG4gICAgICAvLyB7Ym9vbGVhbn0gLSBpbmRpY2F0ZXMgaWYgdGhlICdFbGFzdGljaXR5JyBOdW1iZXJDb250cm9sIGlzIGluY2x1ZGVkLlxyXG4gICAgICBpbmNsdWRlRWxhc3RpY2l0eU51bWJlckNvbnRyb2w6IHRydWUsXHJcblxyXG4gICAgICAvLyB7T2JqZWN0fSAtIHBhc3NlZCB0byB0aGUgRWxhc3RpY2l0eU51bWJlckNvbnRyb2wsIGlmIGl0IGlzIGluY2x1ZGVkLlxyXG4gICAgICBlbGFzdGljaXR5TnVtYmVyQ29udHJvbE9wdGlvbnM6IG51bGxcclxuXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gTWFrZSB0aGUgcGFuZWwgYSBmaXhlZCB3aWR0aC5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMubWluV2lkdGggPT09IHVuZGVmaW5lZCwgJ0NvbGxpc2lvbkxhYkNvbnRyb2xQYW5lbCBzZXRzIG1pbldpZHRoJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5tYXhXaWR0aCA9PT0gdW5kZWZpbmVkLCAnQ29sbGlzaW9uTGFiQ29udHJvbFBhbmVsIHNldHMgbWF4V2lkdGgnICk7XHJcbiAgICBjb25zdCBwYW5lbFdpZHRoID0gQ29sbGlzaW9uTGFiQ29uc3RhbnRzLkNPTlRST0xfUEFORUxfQ09OVEVOVF9XSURUSCArIDIgKiBvcHRpb25zLnhNYXJnaW47XHJcbiAgICBvcHRpb25zLm1pbldpZHRoID0gcGFuZWxXaWR0aDtcclxuICAgIG9wdGlvbnMubWF4V2lkdGggPSBwYW5lbFdpZHRoO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgY29udGVudCBOb2RlIG9mIHRoZSBDb250cm9sIFBhbmVsLlxyXG4gICAgY29uc3QgY29udGVudE5vZGUgPSBuZXcgVkJveCggeyBzcGFjaW5nOiBvcHRpb25zLmNvbnRlbnRTcGFjaW5nLCBhbGlnbjogJ2xlZnQnIH0gKTtcclxuICAgIHN1cGVyKCBjb250ZW50Tm9kZSwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEBwcm90ZWN0ZWQge05vZGV9IC0gdGhlIGNvbnRlbnQgTm9kZS4gVGhpcyBpcyByZWZlcmVuY2VkIGZvciBsYXlvdXRpbmcgcHVycG9zZXMgaW4gc3ViLWNsYXNzZXMuXHJcbiAgICB0aGlzLmNvbnRlbnROb2RlID0gY29udGVudE5vZGU7XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgLy8gJ1ZlbG9jaXR5JyB2aXNpYmlsaXR5IENoZWNrYm94XHJcbiAgICBjb25zdCB2ZWxvY2l0eUNoZWNrYm94ID0gbmV3IENvbGxpc2lvbkxhYkNoZWNrYm94KCB2aWV3UHJvcGVydGllcy52ZWxvY2l0eVZlY3RvclZpc2libGVQcm9wZXJ0eSwgQ29sbGlzaW9uTGFiU3RyaW5ncy52ZWxvY2l0eSwge1xyXG4gICAgICBpY29uOiBDb2xsaXNpb25MYWJJY29uRmFjdG9yeS5jcmVhdGVWZWxvY2l0eVZlY3Rvckljb24oKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vICdNb21lbnR1bScgdmlzaWJpbGl0eSBDaGVja2JveFxyXG4gICAgY29uc3QgbW9tZW50dW1DaGVja2JveCA9IG5ldyBDb2xsaXNpb25MYWJDaGVja2JveCggdmlld1Byb3BlcnRpZXMubW9tZW50dW1WZWN0b3JWaXNpYmxlUHJvcGVydHksIENvbGxpc2lvbkxhYlN0cmluZ3MubW9tZW50dW0sIHtcclxuICAgICAgaWNvbjogQ29sbGlzaW9uTGFiSWNvbkZhY3RvcnkuY3JlYXRlTW9tZW50dW1WZWN0b3JJY29uKClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJvdGVjdGVkIHtDaGVja2JveH0gLSAnQ2VudGVyIG9mIE1hc3MnIHZpc2liaWxpdHkgQ2hlY2tib3guIFRoaXMgaXMgcmVmZXJlbmNlZCBmb3Igb3JkZXJpbmcgaW4gc3ViLWNsYXNzZXMuXHJcbiAgICB0aGlzLmNlbnRlck9mTWFzc0NoZWNrYm94ID0gbmV3IENvbGxpc2lvbkxhYkNoZWNrYm94KCBjZW50ZXJPZk1hc3NWaXNpYmxlUHJvcGVydHksIENvbGxpc2lvbkxhYlN0cmluZ3MuY2VudGVyT2ZNYXNzLCB7XHJcbiAgICAgIGljb246IENvbGxpc2lvbkxhYkljb25GYWN0b3J5LmNyZWF0ZUNlbnRlck9mTWFzc0ljb24oKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vICdLaW5ldGljIEVuZXJneScgdmlzaWJpbGl0eSBDaGVja2JveFxyXG4gICAgY29uc3Qga2luZXRpY0VuZXJneUNoZWNrYm94ID0gbmV3IENvbGxpc2lvbkxhYkNoZWNrYm94KCB2aWV3UHJvcGVydGllcy5raW5ldGljRW5lcmd5VmlzaWJsZVByb3BlcnR5LCBDb2xsaXNpb25MYWJTdHJpbmdzLmtpbmV0aWNFbmVyZ3kgKTtcclxuXHJcbiAgICAvLyAnVmFsdWVzJyB2aXNpYmlsaXR5IENoZWNrYm94LiBUaGlzIGlzIHJlZmVyZW5jZWQgZm9yIG9yZGVyaW5nIGluIHN1Yi1jbGFzc2VzLlxyXG4gICAgY29uc3QgdmFsdWVzQ2hlY2tib3ggPSBuZXcgQ29sbGlzaW9uTGFiQ2hlY2tib3goIHZpZXdQcm9wZXJ0aWVzLnZhbHVlc1Zpc2libGVQcm9wZXJ0eSwgQ29sbGlzaW9uTGFiU3RyaW5ncy52YWx1ZXMgKTtcclxuXHJcbiAgICAvLyBAcHJvdGVjdGVkIHtDaGVja2JveH0gLSAnQ29uc3RhbnQgU2l6ZScgQ2hlY2tib3guIEV4cG9zZWQgdG8gc3ViLWNsYXNzZXMgZm9yIGxheW91dGluZy5cclxuICAgIHRoaXMuY29uc3RhbnRTaXplQ2hlY2tib3ggPSBuZXcgQ29sbGlzaW9uTGFiQ2hlY2tib3goIGJhbGxzQ29uc3RhbnRTaXplUHJvcGVydHksIENvbGxpc2lvbkxhYlN0cmluZ3MuY29uc3RhbnRTaXplICk7XHJcblxyXG4gICAgY29uc3QgaFNlcGFyYXRvciA9IG5ldyBIU2VwYXJhdG9yKCB7IHN0cm9rZTogQ29sb3IuQkxBQ0sgfSApO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIC8vIFNldCB0aGUgY2hpbGRyZW4gb2YgdGhlIGNvbnRlbnQgaW4gdGhlIGNvcnJlY3Qgb3JkZXIuXHJcbiAgICBjb250ZW50Tm9kZS5jaGlsZHJlbiA9IFtcclxuICAgICAgdmVsb2NpdHlDaGVja2JveCxcclxuICAgICAgbW9tZW50dW1DaGVja2JveCxcclxuICAgICAgdGhpcy5jZW50ZXJPZk1hc3NDaGVja2JveCxcclxuICAgICAga2luZXRpY0VuZXJneUNoZWNrYm94LFxyXG4gICAgICB2YWx1ZXNDaGVja2JveFxyXG4gICAgXTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIHJlZmxlY3RpbmcgYm9yZGVyIENoZWNrYm94IGlmIGl0IGlzIGluY2x1ZGVkLlxyXG4gICAgaWYgKCBvcHRpb25zLmluY2x1ZGVSZWZsZWN0aW5nQm9yZGVyQ2hlY2tib3ggKSB7XHJcblxyXG4gICAgICAvLyAnUmVmbGVjdGluZyBCb3JkZXInIENoZWNrYm94XHJcbiAgICAgIGNvbnN0IHJlZmxlY3RpbmdCb3JkZXJDaGVja2JveCA9IG5ldyBDb2xsaXNpb25MYWJDaGVja2JveCggcmVmbGVjdGluZ0JvcmRlclByb3BlcnR5LFxyXG4gICAgICAgIENvbGxpc2lvbkxhYlN0cmluZ3MucmVmbGVjdGluZ0JvcmRlciApO1xyXG5cclxuICAgICAgLy8gQWRkIHRoZSBSZWZsZWN0aW5nIEJvcmRlciBDaGVja2JveCBhZnRlciB0aGUgdmFsdWVzIENoZWNrYm94LlxyXG4gICAgICBjb250ZW50Tm9kZS5hZGRDaGlsZCggcmVmbGVjdGluZ0JvcmRlckNoZWNrYm94ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQWRkIHRoZSBwYXRoIENoZWNrYm94IGlmIGl0IGlzIGluY2x1ZGVkLlxyXG4gICAgaWYgKCBvcHRpb25zLmluY2x1ZGVQYXRoQ2hlY2tib3ggKSB7XHJcblxyXG4gICAgICAvLyBDcmVhdGUgdGhlICdQYXRoJyB2aXNpYmlsaXR5IENoZWNrYm94LlxyXG4gICAgICBjb25zdCBwYXRoQ2hlY2tib3ggPSBuZXcgQ29sbGlzaW9uTGFiQ2hlY2tib3goIHBhdGhzVmlzaWJsZVByb3BlcnR5LCBDb2xsaXNpb25MYWJTdHJpbmdzLnBhdGggKTtcclxuXHJcbiAgICAgIC8vIEFkZCB0aGUgJ1BhdGgnIENoZWNrYm94IGFmdGVyIHRoZSAnVmFsdWVzJyBDaGVja2JveC5cclxuICAgICAgY29udGVudE5vZGUuYWRkQ2hpbGQoIHBhdGhDaGVja2JveCApO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnRlbnROb2RlLmFkZENoaWxkKCBoU2VwYXJhdG9yICk7XHJcblxyXG4gICAgLy8gQWRkIHRoZSAnRWxhc3RpY2l0eScgTnVtYmVyQ29udHJvbCBpZiBpdCBpcyBpbmNsdWRlZC5cclxuICAgIGlmICggb3B0aW9ucy5pbmNsdWRlRWxhc3RpY2l0eU51bWJlckNvbnRyb2wgKSB7XHJcblxyXG4gICAgICAvLyAnRWxhc3RpY2l0eScgTnVtYmVyIENvbnRyb2xcclxuICAgICAgY29uc3QgZWxhc3RpY2l0eU51bWJlckNvbnRyb2wgPSBuZXcgRWxhc3RpY2l0eU51bWJlckNvbnRyb2woIGVsYXN0aWNpdHlQZXJjZW50UHJvcGVydHksIG9wdGlvbnMuZWxhc3RpY2l0eU51bWJlckNvbnRyb2xPcHRpb25zICk7XHJcblxyXG4gICAgICAvLyBBZGQgdGhlICdFbGFzdGljaXR5JyBOdW1iZXJDb250cm9sIGFmdGVyIHRoZSBob3Jpem9udGFsIGxpbmUgc2VwYXJhdG9yLlxyXG4gICAgICBjb250ZW50Tm9kZS5hZGRDaGlsZCggZWxhc3RpY2l0eU51bWJlckNvbnRyb2wgKTtcclxuICAgIH1cclxuXHJcbiAgICBjb250ZW50Tm9kZS5hZGRDaGlsZCggdGhpcy5jb25zdGFudFNpemVDaGVja2JveCApO1xyXG5cclxuICAgIC8vIEFwcGx5IGFkZGl0aW9uYWwgQm91bmRzIG11dGF0b3JzLlxyXG4gICAgdGhpcy5tdXRhdGUoIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbmNvbGxpc2lvbkxhYi5yZWdpc3RlciggJ0NvbGxpc2lvbkxhYkNvbnRyb2xQYW5lbCcsIENvbGxpc2lvbkxhYkNvbnRyb2xQYW5lbCApO1xyXG5leHBvcnQgZGVmYXVsdCBDb2xsaXNpb25MYWJDb250cm9sUGFuZWw7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLFdBQVcsTUFBTSwwQ0FBMEM7QUFDbEUsU0FBU0MsS0FBSyxFQUFFQyxVQUFVLEVBQUVDLElBQUksUUFBUSxtQ0FBbUM7QUFDekUsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUNqRCxPQUFPQyxZQUFZLE1BQU0sdUJB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
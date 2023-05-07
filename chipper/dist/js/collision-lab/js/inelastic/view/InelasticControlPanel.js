// Copyright 2020-2022, University of Colorado Boulder

/**
 * InelasticControlPanel is a CollisionLabControlPanel sub-type for the 'Inelastic' screen, which appears on the
 * upper-right corner of the screen.
 *
 * It adds a 'Stick' vs 'Slip' ABSwitch to allow the user to toggle the InelasticCollisionType. The ABSwitch is inserted
 * right below the 'elasticity' NumberControl of the super-class. It also disables the 'elasticity' NumberControl. All
 * other configurations and options are the same.
 *
 * @author Brandon Li
 */

import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { HStrut, Text, VBox } from '../../../../scenery/js/imports.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabStrings from '../../CollisionLabStrings.js';
import CollisionLabConstants from '../../common/CollisionLabConstants.js';
import CollisionLabControlPanel from '../../common/view/CollisionLabControlPanel.js';
import CollisionLabViewProperties from '../../common/view/CollisionLabViewProperties.js';
import StickSlipABSwitch from './StickSlipABSwitch.js';
class InelasticControlPanel extends CollisionLabControlPanel {
  /**
   * @param {CollisionLabViewProperties} viewProperties
   * @param {Property.<boolean>} centerOfMassVisibleProperty
   * @param {Property.<boolean>} pathsVisibleProperty
   * @param {Property.<boolean>} reflectingBorderProperty
   * @param {Property.<number>} elasticityPercentProperty
   * @param {Property.<boolean>} ballsConstantSizeProperty
   * @param {Property.<InelasticCollisionType>} inelasticCollisionTypeProperty
   * @param {Object} [options]
   */
  constructor(viewProperties, centerOfMassVisibleProperty, pathsVisibleProperty, reflectingBorderProperty, elasticityPercentProperty, ballsConstantSizeProperty, inelasticCollisionTypeProperty, options) {
    assert && assert(viewProperties instanceof CollisionLabViewProperties, `invalid viewProperties: ${viewProperties}`);
    assert && AssertUtils.assertPropertyOf(centerOfMassVisibleProperty, 'boolean');
    assert && AssertUtils.assertPropertyOf(reflectingBorderProperty, 'boolean');
    assert && AssertUtils.assertPropertyOf(elasticityPercentProperty, 'number');
    assert && AssertUtils.assertPropertyOf(ballsConstantSizeProperty, 'boolean');
    options = merge({
      // super-class options
      includeElasticityNumberControl: false
    }, options);
    super(viewProperties, centerOfMassVisibleProperty, pathsVisibleProperty, reflectingBorderProperty, elasticityPercentProperty, ballsConstantSizeProperty, options);

    //----------------------------------------------------------------------------------------

    const inelasticCollisionTitle = new Text(CollisionLabStrings.inelasticCollision, {
      font: CollisionLabConstants.PANEL_TITLE_FONT,
      maxWidth: CollisionLabConstants.CONTROL_PANEL_CONTENT_WIDTH // constrain width for i18n
    });

    const elasticityReadout = new Text(StringUtils.fillIn(CollisionLabStrings.pattern.labelEqualsValueUnits, {
      label: CollisionLabStrings.elasticity,
      units: CollisionLabStrings.units.percent,
      value: elasticityPercentProperty.value
    }), {
      font: new PhetFont(12),
      maxWidth: CollisionLabConstants.CONTROL_PANEL_CONTENT_WIDTH
    });

    // Create the 'Stick' vs 'Slip' ABSwitch.
    const stickSlipSwitch = new StickSlipABSwitch(inelasticCollisionTypeProperty);
    const elasticityControls = new VBox({
      spacing: 4,
      children: [elasticityReadout, new HStrut(CollisionLabConstants.CONTROL_PANEL_CONTENT_WIDTH, {
        pickable: false
      }), stickSlipSwitch]
    });
    this.contentNode.insertChild(this.contentNode.indexOfChild(this.constantSizeCheckbox), inelasticCollisionTitle);
    this.contentNode.insertChild(this.contentNode.indexOfChild(this.constantSizeCheckbox), elasticityControls);
  }
}
collisionLab.register('InelasticControlPanel', InelasticControlPanel);
export default InelasticControlPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIkFzc2VydFV0aWxzIiwiU3RyaW5nVXRpbHMiLCJQaGV0Rm9udCIsIkhTdHJ1dCIsIlRleHQiLCJWQm94IiwiY29sbGlzaW9uTGFiIiwiQ29sbGlzaW9uTGFiU3RyaW5ncyIsIkNvbGxpc2lvbkxhYkNvbnN0YW50cyIsIkNvbGxpc2lvbkxhYkNvbnRyb2xQYW5lbCIsIkNvbGxpc2lvbkxhYlZpZXdQcm9wZXJ0aWVzIiwiU3RpY2tTbGlwQUJTd2l0Y2giLCJJbmVsYXN0aWNDb250cm9sUGFuZWwiLCJjb25zdHJ1Y3RvciIsInZpZXdQcm9wZXJ0aWVzIiwiY2VudGVyT2ZNYXNzVmlzaWJsZVByb3BlcnR5IiwicGF0aHNWaXNpYmxlUHJvcGVydHkiLCJyZWZsZWN0aW5nQm9yZGVyUHJvcGVydHkiLCJlbGFzdGljaXR5UGVyY2VudFByb3BlcnR5IiwiYmFsbHNDb25zdGFudFNpemVQcm9wZXJ0eSIsImluZWxhc3RpY0NvbGxpc2lvblR5cGVQcm9wZXJ0eSIsIm9wdGlvbnMiLCJhc3NlcnQiLCJhc3NlcnRQcm9wZXJ0eU9mIiwiaW5jbHVkZUVsYXN0aWNpdHlOdW1iZXJDb250cm9sIiwiaW5lbGFzdGljQ29sbGlzaW9uVGl0bGUiLCJpbmVsYXN0aWNDb2xsaXNpb24iLCJmb250IiwiUEFORUxfVElUTEVfRk9OVCIsIm1heFdpZHRoIiwiQ09OVFJPTF9QQU5FTF9DT05URU5UX1dJRFRIIiwiZWxhc3RpY2l0eVJlYWRvdXQiLCJmaWxsSW4iLCJwYXR0ZXJuIiwibGFiZWxFcXVhbHNWYWx1ZVVuaXRzIiwibGFiZWwiLCJlbGFzdGljaXR5IiwidW5pdHMiLCJwZXJjZW50IiwidmFsdWUiLCJzdGlja1NsaXBTd2l0Y2giLCJlbGFzdGljaXR5Q29udHJvbHMiLCJzcGFjaW5nIiwiY2hpbGRyZW4iLCJwaWNrYWJsZSIsImNvbnRlbnROb2RlIiwiaW5zZXJ0Q2hpbGQiLCJpbmRleE9mQ2hpbGQiLCJjb25zdGFudFNpemVDaGVja2JveCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiSW5lbGFzdGljQ29udHJvbFBhbmVsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEluZWxhc3RpY0NvbnRyb2xQYW5lbCBpcyBhIENvbGxpc2lvbkxhYkNvbnRyb2xQYW5lbCBzdWItdHlwZSBmb3IgdGhlICdJbmVsYXN0aWMnIHNjcmVlbiwgd2hpY2ggYXBwZWFycyBvbiB0aGVcclxuICogdXBwZXItcmlnaHQgY29ybmVyIG9mIHRoZSBzY3JlZW4uXHJcbiAqXHJcbiAqIEl0IGFkZHMgYSAnU3RpY2snIHZzICdTbGlwJyBBQlN3aXRjaCB0byBhbGxvdyB0aGUgdXNlciB0byB0b2dnbGUgdGhlIEluZWxhc3RpY0NvbGxpc2lvblR5cGUuIFRoZSBBQlN3aXRjaCBpcyBpbnNlcnRlZFxyXG4gKiByaWdodCBiZWxvdyB0aGUgJ2VsYXN0aWNpdHknIE51bWJlckNvbnRyb2wgb2YgdGhlIHN1cGVyLWNsYXNzLiBJdCBhbHNvIGRpc2FibGVzIHRoZSAnZWxhc3RpY2l0eScgTnVtYmVyQ29udHJvbC4gQWxsXHJcbiAqIG90aGVyIGNvbmZpZ3VyYXRpb25zIGFuZCBvcHRpb25zIGFyZSB0aGUgc2FtZS5cclxuICpcclxuICogQGF1dGhvciBCcmFuZG9uIExpXHJcbiAqL1xyXG5cclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBBc3NlcnRVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL0Fzc2VydFV0aWxzLmpzJztcclxuaW1wb3J0IFN0cmluZ1V0aWxzIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdXRpbC9TdHJpbmdVdGlscy5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBIU3RydXQsIFRleHQsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgY29sbGlzaW9uTGFiIGZyb20gJy4uLy4uL2NvbGxpc2lvbkxhYi5qcyc7XHJcbmltcG9ydCBDb2xsaXNpb25MYWJTdHJpbmdzIGZyb20gJy4uLy4uL0NvbGxpc2lvbkxhYlN0cmluZ3MuanMnO1xyXG5pbXBvcnQgQ29sbGlzaW9uTGFiQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9Db2xsaXNpb25MYWJDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgQ29sbGlzaW9uTGFiQ29udHJvbFBhbmVsIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L0NvbGxpc2lvbkxhYkNvbnRyb2xQYW5lbC5qcyc7XHJcbmltcG9ydCBDb2xsaXNpb25MYWJWaWV3UHJvcGVydGllcyBmcm9tICcuLi8uLi9jb21tb24vdmlldy9Db2xsaXNpb25MYWJWaWV3UHJvcGVydGllcy5qcyc7XHJcbmltcG9ydCBTdGlja1NsaXBBQlN3aXRjaCBmcm9tICcuL1N0aWNrU2xpcEFCU3dpdGNoLmpzJztcclxuXHJcbmNsYXNzIEluZWxhc3RpY0NvbnRyb2xQYW5lbCBleHRlbmRzIENvbGxpc2lvbkxhYkNvbnRyb2xQYW5lbCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7Q29sbGlzaW9uTGFiVmlld1Byb3BlcnRpZXN9IHZpZXdQcm9wZXJ0aWVzXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48Ym9vbGVhbj59IGNlbnRlck9mTWFzc1Zpc2libGVQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPGJvb2xlYW4+fSBwYXRoc1Zpc2libGVQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPGJvb2xlYW4+fSByZWZsZWN0aW5nQm9yZGVyUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5LjxudW1iZXI+fSBlbGFzdGljaXR5UGVyY2VudFByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48Ym9vbGVhbj59IGJhbGxzQ29uc3RhbnRTaXplUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5LjxJbmVsYXN0aWNDb2xsaXNpb25UeXBlPn0gaW5lbGFzdGljQ29sbGlzaW9uVHlwZVByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCB2aWV3UHJvcGVydGllcyxcclxuICAgICAgICAgICAgICAgY2VudGVyT2ZNYXNzVmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICAgICAgICAgICBwYXRoc1Zpc2libGVQcm9wZXJ0eSxcclxuICAgICAgICAgICAgICAgcmVmbGVjdGluZ0JvcmRlclByb3BlcnR5LFxyXG4gICAgICAgICAgICAgICBlbGFzdGljaXR5UGVyY2VudFByb3BlcnR5LFxyXG4gICAgICAgICAgICAgICBiYWxsc0NvbnN0YW50U2l6ZVByb3BlcnR5LFxyXG4gICAgICAgICAgICAgICBpbmVsYXN0aWNDb2xsaXNpb25UeXBlUHJvcGVydHksXHJcbiAgICAgICAgICAgICAgIG9wdGlvbnMgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB2aWV3UHJvcGVydGllcyBpbnN0YW5jZW9mIENvbGxpc2lvbkxhYlZpZXdQcm9wZXJ0aWVzLCBgaW52YWxpZCB2aWV3UHJvcGVydGllczogJHt2aWV3UHJvcGVydGllc31gICk7XHJcbiAgICBhc3NlcnQgJiYgQXNzZXJ0VXRpbHMuYXNzZXJ0UHJvcGVydHlPZiggY2VudGVyT2ZNYXNzVmlzaWJsZVByb3BlcnR5LCAnYm9vbGVhbicgKTtcclxuICAgIGFzc2VydCAmJiBBc3NlcnRVdGlscy5hc3NlcnRQcm9wZXJ0eU9mKCByZWZsZWN0aW5nQm9yZGVyUHJvcGVydHksICdib29sZWFuJyApO1xyXG4gICAgYXNzZXJ0ICYmIEFzc2VydFV0aWxzLmFzc2VydFByb3BlcnR5T2YoIGVsYXN0aWNpdHlQZXJjZW50UHJvcGVydHksICdudW1iZXInICk7XHJcbiAgICBhc3NlcnQgJiYgQXNzZXJ0VXRpbHMuYXNzZXJ0UHJvcGVydHlPZiggYmFsbHNDb25zdGFudFNpemVQcm9wZXJ0eSwgJ2Jvb2xlYW4nICk7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcblxyXG4gICAgICAvLyBzdXBlci1jbGFzcyBvcHRpb25zXHJcbiAgICAgIGluY2x1ZGVFbGFzdGljaXR5TnVtYmVyQ29udHJvbDogZmFsc2VcclxuXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIHZpZXdQcm9wZXJ0aWVzLFxyXG4gICAgICBjZW50ZXJPZk1hc3NWaXNpYmxlUHJvcGVydHksXHJcbiAgICAgIHBhdGhzVmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICByZWZsZWN0aW5nQm9yZGVyUHJvcGVydHksXHJcbiAgICAgIGVsYXN0aWNpdHlQZXJjZW50UHJvcGVydHksXHJcbiAgICAgIGJhbGxzQ29uc3RhbnRTaXplUHJvcGVydHksXHJcbiAgICAgIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcblxyXG4gICAgY29uc3QgaW5lbGFzdGljQ29sbGlzaW9uVGl0bGUgPSBuZXcgVGV4dCggQ29sbGlzaW9uTGFiU3RyaW5ncy5pbmVsYXN0aWNDb2xsaXNpb24sIHtcclxuICAgICAgZm9udDogQ29sbGlzaW9uTGFiQ29uc3RhbnRzLlBBTkVMX1RJVExFX0ZPTlQsXHJcbiAgICAgIG1heFdpZHRoOiBDb2xsaXNpb25MYWJDb25zdGFudHMuQ09OVFJPTF9QQU5FTF9DT05URU5UX1dJRFRIIC8vIGNvbnN0cmFpbiB3aWR0aCBmb3IgaTE4blxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGVsYXN0aWNpdHlSZWFkb3V0ID0gbmV3IFRleHQoIFN0cmluZ1V0aWxzLmZpbGxJbiggQ29sbGlzaW9uTGFiU3RyaW5ncy5wYXR0ZXJuLmxhYmVsRXF1YWxzVmFsdWVVbml0cywge1xyXG4gICAgICBsYWJlbDogQ29sbGlzaW9uTGFiU3RyaW5ncy5lbGFzdGljaXR5LFxyXG4gICAgICB1bml0czogQ29sbGlzaW9uTGFiU3RyaW5ncy51bml0cy5wZXJjZW50LFxyXG4gICAgICB2YWx1ZTogZWxhc3RpY2l0eVBlcmNlbnRQcm9wZXJ0eS52YWx1ZVxyXG4gICAgfSApLCB7XHJcbiAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMTIgKSxcclxuICAgICAgbWF4V2lkdGg6IENvbGxpc2lvbkxhYkNvbnN0YW50cy5DT05UUk9MX1BBTkVMX0NPTlRFTlRfV0lEVEhcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlICdTdGljaycgdnMgJ1NsaXAnIEFCU3dpdGNoLlxyXG4gICAgY29uc3Qgc3RpY2tTbGlwU3dpdGNoID0gbmV3IFN0aWNrU2xpcEFCU3dpdGNoKCBpbmVsYXN0aWNDb2xsaXNpb25UeXBlUHJvcGVydHkgKTtcclxuXHJcbiAgICBjb25zdCBlbGFzdGljaXR5Q29udHJvbHMgPSBuZXcgVkJveCgge1xyXG4gICAgICBzcGFjaW5nOiA0LCBjaGlsZHJlbjogW1xyXG4gICAgICAgIGVsYXN0aWNpdHlSZWFkb3V0LFxyXG4gICAgICAgIG5ldyBIU3RydXQoIENvbGxpc2lvbkxhYkNvbnN0YW50cy5DT05UUk9MX1BBTkVMX0NPTlRFTlRfV0lEVEgsIHsgcGlja2FibGU6IGZhbHNlIH0gKSxcclxuICAgICAgICBzdGlja1NsaXBTd2l0Y2hcclxuICAgICAgXVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuY29udGVudE5vZGUuaW5zZXJ0Q2hpbGQoIHRoaXMuY29udGVudE5vZGUuaW5kZXhPZkNoaWxkKCB0aGlzLmNvbnN0YW50U2l6ZUNoZWNrYm94ICksIGluZWxhc3RpY0NvbGxpc2lvblRpdGxlICk7XHJcbiAgICB0aGlzLmNvbnRlbnROb2RlLmluc2VydENoaWxkKCB0aGlzLmNvbnRlbnROb2RlLmluZGV4T2ZDaGlsZCggdGhpcy5jb25zdGFudFNpemVDaGVja2JveCApLCBlbGFzdGljaXR5Q29udHJvbHMgKTtcclxuICB9XHJcbn1cclxuXHJcbmNvbGxpc2lvbkxhYi5yZWdpc3RlciggJ0luZWxhc3RpY0NvbnRyb2xQYW5lbCcsIEluZWxhc3RpY0NvbnRyb2xQYW5lbCApO1xyXG5leHBvcnQgZGVmYXVsdCBJbmVsYXN0aWNDb250cm9sUGFuZWw7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLFdBQVcsTUFBTSwwQ0FBMEM7QUFDbEUsT0FBT0MsV0FBVyxNQUFNLCtDQUErQztBQUN2RSxPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELFNBQVNDLE1BQU0sRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ3RFLE9BQU9DLFlBQVksTUFBTSx1QkFBdUI7QUFDaEQsT0FBT0MsbUJBQW1CLE1BQU0sOEJBQThCO0FBQzlELE9BQU9DLHFCQUFxQixNQUFNLHVDQUF1QztBQUN6RSxPQUFPQyx3QkFBd0IsTUFBTSwrQ0FBK0M7QUFDcEYsT0FBT0MsMEJBQTBCLE1BQU0saURBQWlEO0FBQ3hGLE9BQU9DLGlCQUFpQixNQUFNLHdCQUF3QjtBQUV0RCxNQUFNQyxxQkFBcUIsU0FBU0gsd0JBQXdCLENBQUM7RUFFM0Q7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUksV0FBV0EsQ0FBRUMsY0FBYyxFQUNkQywyQkFBMkIsRUFDM0JDLG9CQUFvQixFQUNwQkMsd0JBQXdCLEVBQ3hCQyx5QkFBeUIsRUFDekJDLHlCQUF5QixFQUN6QkMsOEJBQThCLEVBQzlCQyxPQUFPLEVBQUc7SUFDckJDLE1BQU0sSUFBSUEsTUFBTSxDQUFFUixjQUFjLFlBQVlKLDBCQUEwQixFQUFHLDJCQUEwQkksY0FBZSxF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
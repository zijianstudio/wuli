// Copyright 2022, University of Colorado Boulder

/**
 * Creates the syncButton that will sync representations in sim when fired
 *
 * @author Marla Schulz (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import meanShareAndBalance from '../../meanShareAndBalance.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import SyncIcon from './SyncIcon.js';
import MeanShareAndBalanceStrings from '../../MeanShareAndBalanceStrings.js';
import MeanShareAndBalanceConstants from '../MeanShareAndBalanceConstants.js';
import { Node, Text } from '../../../../scenery/js/imports.js';
import optionize from '../../../../phet-core/js/optionize.js';
export default class SyncButton extends RectangularPushButton {
  constructor(providedOptions) {
    const syncIcon = new SyncIcon();
    const syncContent = new Node({
      children: [syncIcon, new Text(MeanShareAndBalanceStrings.syncStringProperty, {
        left: syncIcon.right + 5,
        centerY: syncIcon.centerY,
        fontSize: 15,
        maxWidth: MeanShareAndBalanceConstants.MAX_CONTROLS_TEXT_WIDTH - syncIcon.width
      })]
    });
    const options = optionize()({
      content: syncContent,
      baseColor: 'white',
      accessibleName: MeanShareAndBalanceStrings.syncStringProperty
    }, providedOptions);
    super(options);
  }
}
meanShareAndBalance.register('SyncButton', SyncButton);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZWFuU2hhcmVBbmRCYWxhbmNlIiwiUmVjdGFuZ3VsYXJQdXNoQnV0dG9uIiwiU3luY0ljb24iLCJNZWFuU2hhcmVBbmRCYWxhbmNlU3RyaW5ncyIsIk1lYW5TaGFyZUFuZEJhbGFuY2VDb25zdGFudHMiLCJOb2RlIiwiVGV4dCIsIm9wdGlvbml6ZSIsIlN5bmNCdXR0b24iLCJjb25zdHJ1Y3RvciIsInByb3ZpZGVkT3B0aW9ucyIsInN5bmNJY29uIiwic3luY0NvbnRlbnQiLCJjaGlsZHJlbiIsInN5bmNTdHJpbmdQcm9wZXJ0eSIsImxlZnQiLCJyaWdodCIsImNlbnRlclkiLCJmb250U2l6ZSIsIm1heFdpZHRoIiwiTUFYX0NPTlRST0xTX1RFWFRfV0lEVEgiLCJ3aWR0aCIsIm9wdGlvbnMiLCJjb250ZW50IiwiYmFzZUNvbG9yIiwiYWNjZXNzaWJsZU5hbWUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlN5bmNCdXR0b24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgdGhlIHN5bmNCdXR0b24gdGhhdCB3aWxsIHN5bmMgcmVwcmVzZW50YXRpb25zIGluIHNpbSB3aGVuIGZpcmVkXHJcbiAqXHJcbiAqIEBhdXRob3IgTWFybGEgU2NodWx6IChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBtZWFuU2hhcmVBbmRCYWxhbmNlIGZyb20gJy4uLy4uL21lYW5TaGFyZUFuZEJhbGFuY2UuanMnO1xyXG5pbXBvcnQgUmVjdGFuZ3VsYXJQdXNoQnV0dG9uLCB7IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvYnV0dG9ucy9SZWN0YW5ndWxhclB1c2hCdXR0b24uanMnO1xyXG5pbXBvcnQgU3luY0ljb24gZnJvbSAnLi9TeW5jSWNvbi5qcyc7XHJcbmltcG9ydCBNZWFuU2hhcmVBbmRCYWxhbmNlU3RyaW5ncyBmcm9tICcuLi8uLi9NZWFuU2hhcmVBbmRCYWxhbmNlU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBNZWFuU2hhcmVBbmRCYWxhbmNlQ29uc3RhbnRzIGZyb20gJy4uL01lYW5TaGFyZUFuZEJhbGFuY2VDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgeyBOb2RlLCBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG50eXBlIFN5bmNCdXR0b25PcHRpb25zID0gU2VsZk9wdGlvbnMgJiBTdHJpY3RPbWl0PFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbk9wdGlvbnMsICdjb250ZW50JyB8ICdiYXNlQ29sb3InIHwgJ2FjY2Vzc2libGVOYW1lJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTeW5jQnV0dG9uIGV4dGVuZHMgUmVjdGFuZ3VsYXJQdXNoQnV0dG9uIHtcclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9uczogU3luY0J1dHRvbk9wdGlvbnMgKSB7XHJcbiAgICBjb25zdCBzeW5jSWNvbiA9IG5ldyBTeW5jSWNvbigpO1xyXG4gICAgY29uc3Qgc3luY0NvbnRlbnQgPSBuZXcgTm9kZSgge1xyXG4gICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgIHN5bmNJY29uLFxyXG4gICAgICAgIG5ldyBUZXh0KCBNZWFuU2hhcmVBbmRCYWxhbmNlU3RyaW5ncy5zeW5jU3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgICAgIGxlZnQ6IHN5bmNJY29uLnJpZ2h0ICsgNSxcclxuICAgICAgICAgIGNlbnRlclk6IHN5bmNJY29uLmNlbnRlclksXHJcbiAgICAgICAgICBmb250U2l6ZTogMTUsXHJcbiAgICAgICAgICBtYXhXaWR0aDogTWVhblNoYXJlQW5kQmFsYW5jZUNvbnN0YW50cy5NQVhfQ09OVFJPTFNfVEVYVF9XSURUSCAtIHN5bmNJY29uLndpZHRoXHJcbiAgICAgICAgfSApXHJcbiAgICAgIF1cclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFN5bmNCdXR0b25PcHRpb25zLCBTZWxmT3B0aW9ucywgUmVjdGFuZ3VsYXJQdXNoQnV0dG9uT3B0aW9ucz4oKSgge1xyXG4gICAgICBjb250ZW50OiBzeW5jQ29udGVudCxcclxuICAgICAgYmFzZUNvbG9yOiAnd2hpdGUnLFxyXG4gICAgICBhY2Nlc3NpYmxlTmFtZTogTWVhblNoYXJlQW5kQmFsYW5jZVN0cmluZ3Muc3luY1N0cmluZ1Byb3BlcnR5XHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxubWVhblNoYXJlQW5kQmFsYW5jZS5yZWdpc3RlciggJ1N5bmNCdXR0b24nLCBTeW5jQnV0dG9uICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsbUJBQW1CLE1BQU0sOEJBQThCO0FBQzlELE9BQU9DLHFCQUFxQixNQUF3QyxxREFBcUQ7QUFDekgsT0FBT0MsUUFBUSxNQUFNLGVBQWU7QUFDcEMsT0FBT0MsMEJBQTBCLE1BQU0scUNBQXFDO0FBQzVFLE9BQU9DLDRCQUE0QixNQUFNLG9DQUFvQztBQUM3RSxTQUFTQyxJQUFJLEVBQUVDLElBQUksUUFBUSxtQ0FBbUM7QUFDOUQsT0FBT0MsU0FBUyxNQUE0Qix1Q0FBdUM7QUFNbkYsZUFBZSxNQUFNQyxVQUFVLFNBQVNQLHFCQUFxQixDQUFDO0VBQ3JEUSxXQUFXQSxDQUFFQyxlQUFrQyxFQUFHO0lBQ3ZELE1BQU1DLFFBQVEsR0FBRyxJQUFJVCxRQUFRLENBQUMsQ0FBQztJQUMvQixNQUFNVSxXQUFXLEdBQUcsSUFBSVAsSUFBSSxDQUFFO01BQzVCUSxRQUFRLEVBQUUsQ0FDUkYsUUFBUSxFQUNSLElBQUlMLElBQUksQ0FBRUgsMEJBQTBCLENBQUNXLGtCQUFrQixFQUFFO1FBQ3ZEQyxJQUFJLEVBQUVKLFFBQVEsQ0FBQ0ssS0FBSyxHQUFHLENBQUM7UUFDeEJDLE9BQU8sRUFBRU4sUUFBUSxDQUFDTSxPQUFPO1FBQ3pCQyxRQUFRLEVBQUUsRUFBRTtRQUNaQyxRQUFRLEVBQUVmLDRCQUE0QixDQUFDZ0IsdUJBQXVCLEdBQUdULFFBQVEsQ0FBQ1U7TUFDNUUsQ0FBRSxDQUFDO0lBRVAsQ0FBRSxDQUFDO0lBRUgsTUFBTUMsT0FBTyxHQUFHZixTQUFTLENBQStELENBQUMsQ0FBRTtNQUN6RmdCLE9BQU8sRUFBRVgsV0FBVztNQUNwQlksU0FBUyxFQUFFLE9BQU87TUFDbEJDLGNBQWMsRUFBRXRCLDBCQUEwQixDQUFDVztJQUM3QyxDQUFDLEVBQUVKLGVBQWdCLENBQUM7SUFFcEIsS0FBSyxDQUFFWSxPQUFRLENBQUM7RUFDbEI7QUFDRjtBQUVBdEIsbUJBQW1CLENBQUMwQixRQUFRLENBQUUsWUFBWSxFQUFFbEIsVUFBVyxDQUFDIn0=
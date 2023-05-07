// Copyright 2020-2021, University of Colorado Boulder

/**
 * Main model for Multiple Screen.
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import Element from '../../../../nitroglycerin/js/Element.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMBucket from '../../common/model/BAMBucket.js';
import BAMModel from '../../common/model/BAMModel.js';
import CollectionBox from '../../common/model/CollectionBox.js';
import CollectionLayout from '../../common/model/CollectionLayout.js';
import Kit from '../../common/model/Kit.js';
import KitCollection from '../../common/model/KitCollection.js';
import MoleculeList from '../../common/model/MoleculeList.js';
class MultipleModel extends BAMModel {
  constructor() {
    const collectionLayout = new CollectionLayout(true);
    const kitCollection = new KitCollection({
      enableCues: true
    });
    super(kitCollection, collectionLayout, {
      isMultipleCollection: true
    });
    kitCollection.addKit(new Kit(collectionLayout, [new BAMBucket(new Dimension2(400, 200), this.stepEmitter, Element.H, 2), new BAMBucket(new Dimension2(450, 200), this.stepEmitter, Element.O, 2)]), {
      triggerCue: true
    });
    kitCollection.addKit(new Kit(collectionLayout, [new BAMBucket(new Dimension2(500, 200), this.stepEmitter, Element.C, 2), new BAMBucket(new Dimension2(600, 200), this.stepEmitter, Element.O, 4), new BAMBucket(new Dimension2(500, 200), this.stepEmitter, Element.N, 2)]), {
      triggerCue: true
    });
    kitCollection.addKit(new Kit(collectionLayout, [new BAMBucket(new Dimension2(600, 200), this.stepEmitter, Element.H, 12), new BAMBucket(new Dimension2(600, 200), this.stepEmitter, Element.O, 4), new BAMBucket(new Dimension2(500, 200), this.stepEmitter, Element.N, 2)]), {
      triggerCue: true
    });
    kitCollection.addCollectionBox(new CollectionBox(MoleculeList.CO2, 2));
    kitCollection.addCollectionBox(new CollectionBox(MoleculeList.O2, 2));
    kitCollection.addCollectionBox(new CollectionBox(MoleculeList.H2, 4));
    kitCollection.addCollectionBox(new CollectionBox(MoleculeList.NH3, 2));
  }
}
buildAMolecule.register('MultipleModel', MultipleModel);
export default MultipleModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaW1lbnNpb24yIiwiRWxlbWVudCIsImJ1aWxkQU1vbGVjdWxlIiwiQkFNQnVja2V0IiwiQkFNTW9kZWwiLCJDb2xsZWN0aW9uQm94IiwiQ29sbGVjdGlvbkxheW91dCIsIktpdCIsIktpdENvbGxlY3Rpb24iLCJNb2xlY3VsZUxpc3QiLCJNdWx0aXBsZU1vZGVsIiwiY29uc3RydWN0b3IiLCJjb2xsZWN0aW9uTGF5b3V0Iiwia2l0Q29sbGVjdGlvbiIsImVuYWJsZUN1ZXMiLCJpc011bHRpcGxlQ29sbGVjdGlvbiIsImFkZEtpdCIsInN0ZXBFbWl0dGVyIiwiSCIsIk8iLCJ0cmlnZ2VyQ3VlIiwiQyIsIk4iLCJhZGRDb2xsZWN0aW9uQm94IiwiQ08yIiwiTzIiLCJIMiIsIk5IMyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTXVsdGlwbGVNb2RlbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNYWluIG1vZGVsIGZvciBNdWx0aXBsZSBTY3JlZW4uXHJcbiAqXHJcbiAqIEBhdXRob3IgRGVuemVsbCBCYXJuZXR0IChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcclxuaW1wb3J0IEVsZW1lbnQgZnJvbSAnLi4vLi4vLi4vLi4vbml0cm9nbHljZXJpbi9qcy9FbGVtZW50LmpzJztcclxuaW1wb3J0IGJ1aWxkQU1vbGVjdWxlIGZyb20gJy4uLy4uL2J1aWxkQU1vbGVjdWxlLmpzJztcclxuaW1wb3J0IEJBTUJ1Y2tldCBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvQkFNQnVja2V0LmpzJztcclxuaW1wb3J0IEJBTU1vZGVsIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9CQU1Nb2RlbC5qcyc7XHJcbmltcG9ydCBDb2xsZWN0aW9uQm94IGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9Db2xsZWN0aW9uQm94LmpzJztcclxuaW1wb3J0IENvbGxlY3Rpb25MYXlvdXQgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0NvbGxlY3Rpb25MYXlvdXQuanMnO1xyXG5pbXBvcnQgS2l0IGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9LaXQuanMnO1xyXG5pbXBvcnQgS2l0Q29sbGVjdGlvbiBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvS2l0Q29sbGVjdGlvbi5qcyc7XHJcbmltcG9ydCBNb2xlY3VsZUxpc3QgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL01vbGVjdWxlTGlzdC5qcyc7XHJcblxyXG5jbGFzcyBNdWx0aXBsZU1vZGVsIGV4dGVuZHMgQkFNTW9kZWwge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgY29uc3QgY29sbGVjdGlvbkxheW91dCA9IG5ldyBDb2xsZWN0aW9uTGF5b3V0KCB0cnVlICk7XHJcbiAgICBjb25zdCBraXRDb2xsZWN0aW9uID0gbmV3IEtpdENvbGxlY3Rpb24oIHsgZW5hYmxlQ3VlczogdHJ1ZSB9ICk7XHJcbiAgICBzdXBlcigga2l0Q29sbGVjdGlvbiwgY29sbGVjdGlvbkxheW91dCwgeyBpc011bHRpcGxlQ29sbGVjdGlvbjogdHJ1ZSB9ICk7XHJcblxyXG4gICAga2l0Q29sbGVjdGlvbi5hZGRLaXQoIG5ldyBLaXQoIGNvbGxlY3Rpb25MYXlvdXQsIFtcclxuICAgICAgbmV3IEJBTUJ1Y2tldCggbmV3IERpbWVuc2lvbjIoIDQwMCwgMjAwICksIHRoaXMuc3RlcEVtaXR0ZXIsIEVsZW1lbnQuSCwgMiApLFxyXG4gICAgICBuZXcgQkFNQnVja2V0KCBuZXcgRGltZW5zaW9uMiggNDUwLCAyMDAgKSwgdGhpcy5zdGVwRW1pdHRlciwgRWxlbWVudC5PLCAyIClcclxuICAgIF0gKSwgeyB0cmlnZ2VyQ3VlOiB0cnVlIH0gKTtcclxuXHJcbiAgICBraXRDb2xsZWN0aW9uLmFkZEtpdCggbmV3IEtpdCggY29sbGVjdGlvbkxheW91dCwgW1xyXG4gICAgICBuZXcgQkFNQnVja2V0KCBuZXcgRGltZW5zaW9uMiggNTAwLCAyMDAgKSwgdGhpcy5zdGVwRW1pdHRlciwgRWxlbWVudC5DLCAyICksXHJcbiAgICAgIG5ldyBCQU1CdWNrZXQoIG5ldyBEaW1lbnNpb24yKCA2MDAsIDIwMCApLCB0aGlzLnN0ZXBFbWl0dGVyLCBFbGVtZW50Lk8sIDQgKSxcclxuICAgICAgbmV3IEJBTUJ1Y2tldCggbmV3IERpbWVuc2lvbjIoIDUwMCwgMjAwICksIHRoaXMuc3RlcEVtaXR0ZXIsIEVsZW1lbnQuTiwgMiApXHJcbiAgICBdICksIHsgdHJpZ2dlckN1ZTogdHJ1ZSB9ICk7XHJcbiAgICBraXRDb2xsZWN0aW9uLmFkZEtpdCggbmV3IEtpdCggY29sbGVjdGlvbkxheW91dCwgW1xyXG4gICAgICBuZXcgQkFNQnVja2V0KCBuZXcgRGltZW5zaW9uMiggNjAwLCAyMDAgKSwgdGhpcy5zdGVwRW1pdHRlciwgRWxlbWVudC5ILCAxMiApLFxyXG4gICAgICBuZXcgQkFNQnVja2V0KCBuZXcgRGltZW5zaW9uMiggNjAwLCAyMDAgKSwgdGhpcy5zdGVwRW1pdHRlciwgRWxlbWVudC5PLCA0ICksXHJcbiAgICAgIG5ldyBCQU1CdWNrZXQoIG5ldyBEaW1lbnNpb24yKCA1MDAsIDIwMCApLCB0aGlzLnN0ZXBFbWl0dGVyLCBFbGVtZW50Lk4sIDIgKVxyXG4gICAgXSApLCB7IHRyaWdnZXJDdWU6IHRydWUgfSApO1xyXG4gICAga2l0Q29sbGVjdGlvbi5hZGRDb2xsZWN0aW9uQm94KCBuZXcgQ29sbGVjdGlvbkJveCggTW9sZWN1bGVMaXN0LkNPMiwgMiApICk7XHJcbiAgICBraXRDb2xsZWN0aW9uLmFkZENvbGxlY3Rpb25Cb3goIG5ldyBDb2xsZWN0aW9uQm94KCBNb2xlY3VsZUxpc3QuTzIsIDIgKSApO1xyXG4gICAga2l0Q29sbGVjdGlvbi5hZGRDb2xsZWN0aW9uQm94KCBuZXcgQ29sbGVjdGlvbkJveCggTW9sZWN1bGVMaXN0LkgyLCA0ICkgKTtcclxuICAgIGtpdENvbGxlY3Rpb24uYWRkQ29sbGVjdGlvbkJveCggbmV3IENvbGxlY3Rpb25Cb3goIE1vbGVjdWxlTGlzdC5OSDMsIDIgKSApO1xyXG4gIH1cclxufVxyXG5cclxuYnVpbGRBTW9sZWN1bGUucmVnaXN0ZXIoICdNdWx0aXBsZU1vZGVsJywgTXVsdGlwbGVNb2RlbCApO1xyXG5leHBvcnQgZGVmYXVsdCBNdWx0aXBsZU1vZGVsOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxVQUFVLE1BQU0sa0NBQWtDO0FBQ3pELE9BQU9DLE9BQU8sTUFBTSx5Q0FBeUM7QUFDN0QsT0FBT0MsY0FBYyxNQUFNLHlCQUF5QjtBQUNwRCxPQUFPQyxTQUFTLE1BQU0saUNBQWlDO0FBQ3ZELE9BQU9DLFFBQVEsTUFBTSxnQ0FBZ0M7QUFDckQsT0FBT0MsYUFBYSxNQUFNLHFDQUFxQztBQUMvRCxPQUFPQyxnQkFBZ0IsTUFBTSx3Q0FBd0M7QUFDckUsT0FBT0MsR0FBRyxNQUFNLDJCQUEyQjtBQUMzQyxPQUFPQyxhQUFhLE1BQU0scUNBQXFDO0FBQy9ELE9BQU9DLFlBQVksTUFBTSxvQ0FBb0M7QUFFN0QsTUFBTUMsYUFBYSxTQUFTTixRQUFRLENBQUM7RUFDbkNPLFdBQVdBLENBQUEsRUFBRztJQUNaLE1BQU1DLGdCQUFnQixHQUFHLElBQUlOLGdCQUFnQixDQUFFLElBQUssQ0FBQztJQUNyRCxNQUFNTyxhQUFhLEdBQUcsSUFBSUwsYUFBYSxDQUFFO01BQUVNLFVBQVUsRUFBRTtJQUFLLENBQUUsQ0FBQztJQUMvRCxLQUFLLENBQUVELGFBQWEsRUFBRUQsZ0JBQWdCLEVBQUU7TUFBRUcsb0JBQW9CLEVBQUU7SUFBSyxDQUFFLENBQUM7SUFFeEVGLGFBQWEsQ0FBQ0csTUFBTSxDQUFFLElBQUlULEdBQUcsQ0FBRUssZ0JBQWdCLEVBQUUsQ0FDL0MsSUFBSVQsU0FBUyxDQUFFLElBQUlILFVBQVUsQ0FB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
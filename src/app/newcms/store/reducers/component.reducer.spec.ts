import * as fromComponent from './component.reducer';
import * as fromActions from '../actions/component.action';

fdescribe('Cms Component Reducer', () => {
  describe('undefined action', () => {
    it('should return the default state', () => {
      const { initialState } = fromComponent;
      const action = {} as any;
      const state = fromComponent.reducer(undefined, action);

      expect(state).toBe(initialState);
    });
  });

  describe('LOAD_COMPONENT_SUCCESS or GET_COMPONENET_FROM_PAGE action', () => {
    it('should populate the component state entities', () => {
      const components: any[] = [
        { uid: 'comp1', typeCode: 'SimpleBannerComponent' },
        { uid: 'comp2', typeCode: 'CMSLinkComponent' },
        { uid: 'comp3', typeCode: 'NavigationComponent' }
      ];
      const entities = {
        comp1: components[0],
        comp2: components[1],
        comp3: components[2]
      };
      const { initialState } = fromComponent;
      const action = new fromActions.LoadComponentSuccess(components);
      const state = fromComponent.reducer(initialState, action);
      expect(state.entities).toEqual(entities);
    });
  });

  describe('CLEAN_COMPONENT_STATE action', () => {
    it('should clean the component state entities', () => {
      const components: any[] = [
        { uid: 'comp1', typeCode: 'SimpleBannerComponent' },
        { uid: 'comp2', typeCode: 'CMSLinkComponent' },
        { uid: 'comp3', typeCode: 'NavigationComponent' }
      ];
      const entities = {
        comp1: components[0],
        comp2: components[1],
        comp3: components[2]
      };
      const { initialState } = fromComponent;
      const loadAction = new fromActions.LoadComponentSuccess(components);
      const state = fromComponent.reducer(initialState, loadAction);
      const cleanAction = new fromActions.CleanComponentState();
      const newState = fromComponent.reducer(initialState, cleanAction);

      expect(newState).toEqual(initialState);
    });
  });
});
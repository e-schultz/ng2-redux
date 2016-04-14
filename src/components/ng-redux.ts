import {Injectable, Inject} from 'angular2/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Store, Action, ActionCreator, Reducer } from 'redux';
import * as invariant from 'invariant';
import { INgRedux } from './provider';

const VALID_SELECTORS = ['string', 'number', 'symbol', 'function'];
const ERROR_MESSAGE = `Expected selector to be one of: 
${VALID_SELECTORS.join(',')}. Instead recieved %s`;
const checkSelector = (s) => VALID_SELECTORS.indexOf(typeof s, 0) >= 0;

@Injectable()
export class NgRedux<T> implements INgRedux<T> {
  store: BehaviorSubject<T>;

  constructor( @Inject('ngRedux') private _ngRedux) {
    this.store = this.observableFromStore(_ngRedux);
    this._ngRedux.subscribe(() => this.store.next(this._ngRedux.getState()));
    Object.assign(this, _ngRedux);


  }

  select<S>(selector: string | number | symbol | ((state: T) => S),
    comparer?: (x: any, y: any) => boolean): Observable<S> {


    invariant(checkSelector(selector), ERROR_MESSAGE, selector);

    if (
      typeof selector === 'string' ||
      typeof selector === 'number' ||
      typeof selector === 'symbol') {
      return this.store
        .map(state => state[selector])
        .distinctUntilChanged(comparer);
    } else if (typeof selector === 'function') {
      return this.store
        .map(selector).distinctUntilChanged(comparer);
    }

  }

  connect = (mapStateToTarget: Function, mapDispatchToTarget: Function) => {
    return target => this._ngRedux
      .connect(mapStateToTarget, mapDispatchToTarget)(target);
  };

  mapDispatchToTarget = (actions) => (target) => {
    return this._ngRedux.mapDispatchToTarget(actions)(target)
  };

  dispatch = (action: Action | ActionCreator<any>) => {
    return this._ngRedux.dispatch(action);
  };

  observableFromStore = (store: Store<T>) => {
    return new BehaviorSubject(store.getState());
  };

  getState = () => {
    return this._ngRedux.getState();
  };

  subscribe = (...args) => {
    return this._ngRedux.subscribe(...args);
  };

  replaceReducer = (nextReducer: Reducer<T>) => {
    return this._ngRedux.replaceReducer(nextReducer);
  };


}

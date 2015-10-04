import React, { Component } from 'react';
import App from './app';
import { createRedux, createDispatcher, composeStores } from 'redux';
import { Provider } from 'redux/react';

import * as stores from '../reducers/index';
import {addVersion} from '../actions/version';
import {frame, reset} from '../actions/state';
import {counter} from '../examples';

const store = composeStores(stores);

let redux;
function middleware(getState) {
  return (next) => (act) => {
    const action = typeof act === 'function'
      ? act(redux.dispatch, getState) : act;
    const { promise, type, types, ...rest } = action;
    if (type) {
      if (type === 'noop') return null;
    }
    action.dispatch = redux.dispatch;
    if (!promise) {
      return next(action);
    }

    const [REQUEST, SUCCESS, FAILURE] = types;
    next({...rest, type: REQUEST});
    return promise.then(
      (result) => next({...rest, result, type: SUCCESS}),
      (error) => next({...rest, error, type: FAILURE})
    );
  };
}

const dispatcher = createDispatcher(store, (getState) => [middleware(getState)]);

redux = createRedux(dispatcher);

export default class Redux extends Component {

  componentWillMount() {
    redux.dispatch(addVersion(counter));
    redux.dispatch(reset());
  }

  componentDidMount() {
    setInterval(() => redux.dispatch(frame()), 50);
  }

  render() {
    return (
      <Provider redux={redux}>
        {() => <App />}
      </Provider>
    );
  }
}
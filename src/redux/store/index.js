import {createStore} from 'redux';
import user from '../reducer/index';

export const store = createStore(user);

import React from 'react';
import Navigation from './src/navigation/stack';
import {Provider} from 'react-redux';
import {store} from './src/redux/store/index';

const App = () => {
  return (
    <Provider store={store}>
      <Navigation />
    </Provider>
  );
};
export default App;

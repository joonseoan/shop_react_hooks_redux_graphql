import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import AplloClient from 'apollo-boost';
import { ApolloProvider as ApolloProviderHooks } from 'react-apollo-hooks';
import { ApolloProvider } from 'react-apollo';
import { Provider } from 'react-redux';
import { createStore } from 'redux'; 

import './index.css';
import App from './App';
import reducers from './reducers';

// console.log('index localStorage: ', localStorage.getItem('token'))
const client = new AplloClient({
  uri: 'http://localhost:8080/graphql',
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  }
});

const store = createStore(reducers);

const Root = () => {
  return(
    <ApolloProvider client={ client }>
      <Provider store={ store } >
        {/*  <ApolloProviderHooks client={ client }> */}
            {/* <Provider store={ store } > */}
                  <App />
            {/* </Provider> */}
        {/*  </ApolloProviderHooks> */}
      </Provider>
    </ApolloProvider>
  );
}

ReactDOM.render(
  <Root />,
  document.getElementById('root')
);
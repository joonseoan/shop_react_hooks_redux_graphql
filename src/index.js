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

const client = new AplloClient({
  uri: 'http://localhost:8080/graphql'
});

const store = createStore(reducers);

const Root = () => {
  return(
    <ApolloProvider client={ client }>
      <ApolloProviderHooks client={ client }>
        <Provider store={ store } >
              <App />
        </Provider>
      </ApolloProviderHooks>
    </ApolloProvider>
  );
}

ReactDOM.render(
  <Root />,
  document.getElementById('root')
);


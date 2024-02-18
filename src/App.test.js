import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { defaultInstruments } from "./utils/constants";

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ "Global Quote": { "05. price": "123.45" } })
  })
);

beforeEach(() => {
  // Clear all instances and calls to constructor and all methods:
  fetch.mockClear();
});


it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});


it('should have correct initial state', () => {
  const app = new App();
  expect(app.state).toEqual({
    capital: 10000,
    instrumentsUpdated: true,
    instruments: defaultInstruments,
    lastUpdate: app.state.lastUpdate,
  })
})

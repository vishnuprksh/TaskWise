/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);

import App from '../App';

test('renders the TaskWise Android foundation screen', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });

  const renderedOutput = JSON.stringify(renderer!.toJSON());
  expect(renderedOutput).toContain('TASKWISE / ANDROID');
  expect(renderedOutput).toContain('Foundation');
});

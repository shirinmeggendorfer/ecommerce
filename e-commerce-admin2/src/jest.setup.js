import '@testing-library/jest-dom';
import fetchMock from 'jest-fetch-mock';
fetchMock.enableMocks();

global.alert = jest.fn();
global.fetch = require('jest-fetch-mock');

import { TextDecoder, TextEncoder } from 'node:util';

// jsdom does not provide the Encoding API globals that react-router relies on.
const globalScope = globalThis as unknown as Record<string, unknown>;
if (typeof globalScope.TextEncoder === 'undefined') {
  globalScope.TextEncoder = TextEncoder;
}
if (typeof globalScope.TextDecoder === 'undefined') {
  globalScope.TextDecoder = TextDecoder;
}

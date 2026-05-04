import '@testing-library/jest-dom';

// 🔧 Fix para TextEncoder
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
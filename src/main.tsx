import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { updateDocumentTitle } from './utils/environment';

updateDocumentTitle();

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(<App />);

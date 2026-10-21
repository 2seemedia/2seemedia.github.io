import React from 'react';
import {createRoot} from 'react-dom/client';
import PortfolioApp from './ui/PortfolioApp';
import './globals.css';
import './portfolio-gallery.css';
import './light-theme.css';
createRoot(document.getElementById('root')!).render(<PortfolioApp/>);

import './spec-portfolio.css';

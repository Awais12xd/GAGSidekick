// App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import { Analytics } from '@vercel/analytics/react';
import TradingCalculatorPage from "./pages/TradingCalculatorPage.jsx";
import Header from "./components/Header.jsx";
import './App.css';
import Footer from "./components/Footer.jsx";
import LoadingWrapper from "./components/LoadingWrapper.jsx";
 // move your current app content to this

const App = () => {
  return (
   <>
   <LoadingWrapper >
   <Header />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/trading-calculator" element={<TradingCalculatorPage />} />
    </Routes>
    <Footer />
    </LoadingWrapper>
    <Analytics />
   </>
  );
};

export default App;

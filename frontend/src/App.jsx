// App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Home.jsx";
import { Analytics } from '@vercel/analytics/react';

 // move your current app content to this

const App = () => {
  return (
   <>
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
    <Analytics />
   </>
  );
};

export default App;

import React from "react";
import TradeCalculator from "../components/Testing/TradingTest";
import PageBanner from "../components/PageBanner.jsx";
import Heading from "../components/Heading.jsx";

const TradingCalculatorPage = () => {
  return (
    <div className="my-30 max-w-[900px] mx-auto">
      {/* <PageBanner 
      title={"Trading Calculator"}
      subtitle='A Trading Calculator to instantly check whether a trade is fair. Fast, simple, and built for players who want to trade with confidence.'
      lastUpdated={"15 Aug"}

      /> */}
      <div className="px-2">
        <Heading headingText={"Trading Calculator"} />
      </div>
      <div className="mt-6">
        <TradeCalculator />
      </div>
    </div>
  );
};

export default TradingCalculatorPage;

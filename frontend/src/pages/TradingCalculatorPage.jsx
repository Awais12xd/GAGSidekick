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
      <div className="mt-4 px-2">
        <h1 className="text-white text-xl font-semibold">Tutorial</h1>
        <p className="text-gray-400 text-xs text-justify sm:text-sm mt-2">
          Start by building each side of the trade: click the + tile under Player A or Player B to open the picker, search for a pet/item and click it to add. Enter any extra money (shekles) in the small input next to the player label and press Apply (or hit Enter) to include it. The two big totals at the top update automatically and the center verdict shows whether the trade is Fair / You win / You lose; numeric values use compact units (K, M, B, T, Q, Qi, …) so they’re easy to read. Use Swap to swap both offers instantly, Reset to clear everything, and use Present for a focused, read-only view and best for recording view because it removes unnessary things so you can easily take screenshot or make video . Change the visualization with the Visualization selector (Meter or Bar) to see the balance as a gauge or a horizontal bar — read the legend under the bar for exact percentages. That’s it — add items, tune quantities/shekles, and read the verdict and visual gauge to decide whether a trade is fair.
        </p>
      </div>
    </div>
  );
};

export default TradingCalculatorPage;

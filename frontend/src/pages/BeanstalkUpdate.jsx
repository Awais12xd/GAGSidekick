import React from "react";
import PlantsCategories from "../components/categories/PlantsCategories.jsx";
import Testing2 from "../components/Testing2.jsx";
import Text from "../components/Text.jsx";
import Foods from "../components/categories/Foods.jsx"

const BeanstalkUpdate = () => {
  return (
    <div className="mt-12 px-2  sm:px-4 lg:px-5 max-w-[1300px] mx-auto flex flex-col">
      <div className="my-8">
        <Text />
      </div>
      <div className="mb-8">
        <Testing2 />
      </div>
      <div className="mb-8">
        <PlantsCategories />
      </div>
      <div className="mb-9">
        <Foods />
      </div>
    </div>
  );
};

export default BeanstalkUpdate;

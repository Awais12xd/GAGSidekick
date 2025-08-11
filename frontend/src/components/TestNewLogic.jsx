import React from 'react'

 import { useWeather, useSeeds, useGear, useEggs, useCosmetics   } from "../hooks/index.js"
const TestNewLogic = () => {
      // inside component
      const { data: seeds, loading: seedsLoading } = useSeeds(); // seeds will be array or null
      const { data: gear } = useGear();
      const { data: eggs } = useEggs();
      const { data: cosmetics } = useCosmetics();
      const { data: weather } = useWeather();
      console.log(seeds,gear,eggs,cosmetics,weather)
  return (
    <div>
      
    </div>
  )
}

export default TestNewLogic

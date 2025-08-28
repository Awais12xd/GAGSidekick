// App.js (example)
import React from "react";
import UpdateShowcase from "./TestingIdea.jsx";
import { items } from "../data/info.js";
import { fruits , gears , cosmetics } from "../database.js";
import Heading from "./Heading.jsx";
const newNames = {
  seeds: ["Cyclamen","Willowberry","Snaparino Beanarini","Calla Lily","Flare Melon","Glowpod","Crown of Thorns"],
  items: ["Can of Beans","Cleansing Pet Shard","Pet Shard Giantbean","Pet Shard Rainbow","Pet Shard Gold","Pet Shard Silver","Mega Lollipop","Gold Lollipop","Silver Lollipop"],
  cosmetics: ["Egg Incubator","Mutation Machine Booster","Golden Goose Painting","Bean Chair","Giant Painting","Griffin Statue","Bouncy Mushroom","Beanstalk Painting","Bean Sprout Float Light","Bean Pool Table"],
  pets: ["Griffin","Elk","Mandrake","Gnome","Apple Gazelle","Peach Wasp","Lemon Lion","Green Bean"],
  mutations: [{name:"Brainrot", multiplier:"100×"},{name:"Warped", multiplier:"75×"},{name:"Beanbound", multiplier:"100×"},{name:"Gnomed", multiplier:"15×"},{name:"Rot", multiplier:"8×"},{name:"Cyclonic", multiplier:"50×"},{name:"Maelstrom", multiplier:"100×"}]
};

const mutations = [
  { name: "Brainrot",   slug: "brainrot",   multiplier: 100, multiplierDisplay: "100×", emoji: "🧠" },
  { name: "Warped",     slug: "warped",     multiplier: 75,  multiplierDisplay: "75×",  emoji: "🔀" },
  { name: "Beanbound",  slug: "beanbound",  multiplier: 100, multiplierDisplay: "100×", emoji: "🪢" },
  { name: "Gnomed",     slug: "gnomed",     multiplier: 15,  multiplierDisplay: "15×",  emoji: "🧝" },
  { name: "Rot",        slug: "rot",        multiplier: 8,   multiplierDisplay: "8×",   emoji: "🍂" },
  { name: "Cyclonic",   slug: "cyclonic",   multiplier: 50,  multiplierDisplay: "50×",  emoji: "🌀" },
  { name: "Maelstrom",  slug: "maelstrom",  multiplier: 100, multiplierDisplay: "100×", emoji: "🌪️" }
];

function Testing2(){
  return (
    <div id="newItems" className="p-2 md:p-6">
      <div className="mb-4">
        <Heading headingText={"New Items"} />
      </div>
      <UpdateShowcase
        dataSources={{
          seeds: fruits,
          items: gears,
          cosmetics: cosmetics,
          pets: items,
          mutations:mutations
        }}
        newNames={newNames}
      />
    </div>
  );
}

export default Testing2;

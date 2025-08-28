import React, { useState, useEffect } from "react";
import RarityBadge from "../RarityBadge.jsx";
import "../../App.css";
import Heading from "../Heading";

/* Sample item */
// const categories = [
    const berryPlants= [
      {
        "item_id": "blueberry",
        "display_name": "Blueberry",
        "rarity": "Uncommon",
        "currency": "Sheckles",
        "price": "400",
        "icon": "https://api.joshlei.com/v2/growagarden/image/blueberry",
        "description": "",
        "duration": "0",
        "last_seen": "1756210502",
        "type": "seed"
      },
      {
        "item_id": "celestiberry",
        "display_name": "Celestiberry",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/celestiberry",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "cranberry",
        "display_name": "Cranberry",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/cranberry",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "elder_strawberry",
        "display_name": "Elder Strawberry",
        "rarity": "Prismatic",
        "currency": "Sheckles",
        "price": "70000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/elder_strawberry",
        "description": "",
        "duration": "0",
        "last_seen": "1756168204",
        "type": "seed"
      },
      {
        "item_id": "grape",
        "display_name": "Grape",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "850000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/grape",
        "description": "",
        "duration": "0",
        "last_seen": "1756196402",
        "type": "seed"
      },
      {
        "item_id": "lingonberry",
        "display_name": "Lingonberry",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/lingonberry",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "raspberry",
        "display_name": "Raspberry",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/raspberry",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "strawberry",
        "display_name": "Strawberry",
        "rarity": "Common",
        "currency": "Sheckles",
        "price": "50",
        "icon": "https://api.joshlei.com/v2/growagarden/image/strawberry",
        "description": "",
        "duration": "0",
        "last_seen": "1756210502",
        "type": "seed"
      },
      {
        "item_id": "white_mulberry",
        "display_name": "White Mulberry",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/white_mulberry",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      }
    ] 
    const candyPlants = [
      {
        "item_id": "candy_blossom",
        "display_name": "Candy Blossom",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/candy_blossom",
        "description": "",
        "duration": "0",
        "last_seen": "1752040320",
        "type": "seed"
      },
      {
        "item_id": "candy_sunflower",
        "display_name": "Candy Sunflower",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/candy_sunflower",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "chocolate_carrot",
        "display_name": "Chocolate Carrot",
        "rarity": "Common",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/chocolate_carrot",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "easter_egg",
        "display_name": "Easter Egg",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/easter_egg",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "red_lollipop",
        "display_name": "Red Lollipop",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/red_lollipop",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "sugarglaze",
        "display_name": "Sugarglaze",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/sugarglaze",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      }
    ]
    const flowerPlants = [
      {
        "item_id": "artichoke",
        "display_name": "Artichoke",
        "rarity": "Uncommon",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/artichoke",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "bee_balm",
        "display_name": "Bee Balm",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/bee_balm",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "burning_bud",
        "display_name": "Burning Bud",
        "rarity": "Prismatic",
        "currency": "Sheckles",
        "price": "40000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/burning_bud",
        "description": "",
        "duration": "0",
        "last_seen": "1756127701",
        "type": "seed"
      },
      {
        "item_id": "candy_blossom",
        "display_name": "Candy Blossom",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/candy_blossom",
        "description": "",
        "duration": "0",
        "last_seen": "1752040320",
        "type": "seed"
      },
      {
        "item_id": "candy_sunflower",
        "display_name": "Candy Sunflower",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/candy_sunflower",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "cherry_blossom",
        "display_name": "Cherry Blossom",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/cherry_blossom",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "crocus",
        "display_name": "Crocus",
        "rarity": "Uncommon",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/crocus",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "cyclamen",
        "display_name": "Cyclamen",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/cyclamen",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "daffodil",
        "display_name": "Daffodil",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "1000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/daffodil",
        "description": "",
        "duration": "0",
        "last_seen": "1756209302",
        "type": "seed"
      },
      {
        "item_id": "dezen",
        "display_name": "Dezen",
        "rarity": "Uncommon",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/dezen",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "ember_lily",
        "display_name": "Ember Lily",
        "rarity": "Prismatic",
        "currency": "Sheckles",
        "price": "15000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/ember_lily",
        "description": "",
        "duration": "0",
        "last_seen": "1756183204",
        "type": "seed"
      },
      {
        "item_id": "firework_flower",
        "display_name": "Firework Flower",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "10000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/firework_flower",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "flare_daisy",
        "display_name": "Flare Daisy",
        "rarity": "Uncommon",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/flare_daisy",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "foxglove",
        "display_name": "Foxglove",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/foxglove",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "grand_volcania",
        "display_name": "Grand Volcania",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/grand_volcania",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "hinomai",
        "display_name": "Hinomai",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/hinomai",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "honeysuckle",
        "display_name": "Honeysuckle",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/honeysuckle",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "lavender",
        "display_name": "Lavender",
        "rarity": "Uncommon",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/lavender",
        "description": "",
        "duration": "0",
        "last_seen": "1751965891",
        "type": "seed"
      },
      {
        "item_id": "liberty_lily",
        "display_name": "Liberty Lily",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/liberty_lily",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "lilac",
        "display_name": "Lilac",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/lilac",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "lily_of_the_valley",
        "display_name": "Lily of the Valley",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/lily_of_the_valley",
        "description": "",
        "duration": "0",
        "last_seen": "1751711602",
        "type": "seed"
      },
      {
        "item_id": "lotus",
        "display_name": "Lotus",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/lotus",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "manuka_flower",
        "display_name": "Manuka Flower",
        "rarity": "Uncommon",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/manuka_flower",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "monoblooma",
        "display_name": "Monoblooma",
        "rarity": "Uncommon",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/monoblooma",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "moonflower",
        "display_name": "Moonflower",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/moonflower",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "moon_blossom",
        "display_name": "Moon Blossom",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/moon_blossom",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "nightshade",
        "display_name": "Nightshade",
        "rarity": "Uncommon",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/nightshade",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "noble_flower",
        "display_name": "Noble Flower",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/noble_flower",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "orange_tulip",
        "display_name": "Orange Tulip",
        "rarity": "Uncommon",
        "currency": "Sheckles",
        "price": "600",
        "icon": "https://api.joshlei.com/v2/growagarden/image/orange_tulip",
        "description": "",
        "duration": "0",
        "last_seen": "1756210502",
        "type": "seed"
      },
      {
        "item_id": "parasol_flower",
        "display_name": "Parasol Flower",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/parasol_flower",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "pink_lily",
        "display_name": "Pink Lily",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/pink_lily",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "purple_dahlia",
        "display_name": "Purple Dahlia",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/purple_dahlia",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "rafflesia",
        "display_name": "Rafflesia",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "3200",
        "icon": "https://api.joshlei.com/v2/growagarden/image/rafflesia",
        "description": "",
        "duration": "0",
        "last_seen": "1756209603",
        "type": "seed"
      },
      {
        "item_id": "rose",
        "display_name": "Rose",
        "rarity": "Uncommon",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/rose",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "rosy_delight",
        "display_name": "Rosy Delight",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/rosy_delight",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "serenity",
        "display_name": "Serenity",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/serenity",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "soft_sunshine",
        "display_name": "Soft Sunshine",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/soft_sunshine",
        "description": "",
        "duration": "0",
        "last_seen": "1755259201",
        "type": "seed"
      },
      {
        "item_id": "stonebite",
        "display_name": "Stonebite",
        "rarity": "Uncommon",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/stonebite",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "sunflower",
        "display_name": "Sunflower",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/sunflower",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "succulent",
        "display_name": "Succulent",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/succulent",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "taro_flower",
        "display_name": "Taro Flower",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/taro_flower",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "veinpetal",
        "display_name": "Veinpetal",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/veinpetal",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "zenflare",
        "display_name": "Zenflare",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/zenflare",
        "description": "",
        "duration": "0",
        "last_seen": "1755313202",
        "type": "seed"
      }
    ]
    const fruitsPlants = [
      {
        "item_id": "apple",
        "display_name": "Apple",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "3250",
        "icon": "https://api.joshlei.com/v2/growagarden/image/apple",
        "description": "",
        "duration": "0",
        "last_seen": "1756210201",
        "type": "seed"
      },
      {
        "item_id": "avocado",
        "display_name": "Avocado",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "5000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/avocado",
        "description": "",
        "duration": "0",
        "last_seen": "1756180803",
        "type": "seed"
      },
      {
        "item_id": "banana",
        "display_name": "Banana",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "7000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/banana",
        "description": "",
        "duration": "0",
        "last_seen": "1756051206",
        "type": "seed"
      },
      {
        "item_id": "blood_banana",
        "display_name": "Blood Banana",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/blood_banana",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "blueberry",
        "display_name": "Blueberry",
        "rarity": "Uncommon",
        "currency": "Sheckles",
        "price": "400",
        "icon": "https://api.joshlei.com/v2/growagarden/image/blueberry",
        "description": "",
        "duration": "0",
        "last_seen": "1756210502",
        "type": "seed"
      },
      {
        "item_id": "canary_melon",
        "display_name": "Canary Melon",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/canary_melon",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "coconut",
        "display_name": "Coconut",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "6000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/coconut",
        "description": "",
        "duration": "0",
        "last_seen": "1756208401",
        "type": "seed"
      },
      {
        "item_id": "cranberry",
        "display_name": "Cranberry",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/cranberry",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "crown_melon",
        "display_name": "Crown Melon",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/crown_melon",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "dragon_fruit",
        "display_name": "Dragon Fruit",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "50000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/dragon_fruit",
        "description": "",
        "duration": "0",
        "last_seen": "1756208702",
        "type": "seed"
      },
      {
        "item_id": "durian",
        "display_name": "Durian",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/durian",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "grand_tomato",
        "display_name": "Grand Tomato",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/grand_tomato",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "grape",
        "display_name": "Grape",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "850000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/grape",
        "description": "",
        "duration": "0",
        "last_seen": "1756196402",
        "type": "seed"
      },
      {
        "item_id": "green_apple",
        "display_name": "Green Apple",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "3500",
        "icon": "https://api.joshlei.com/v2/growagarden/image/green_apple",
        "description": "",
        "duration": "0",
        "last_seen": "1756209603",
        "type": "seed"
      },
      {
        "item_id": "hive_fruit",
        "display_name": "Hive Fruit",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/hive_fruit",
        "description": "",
        "duration": "0",
        "last_seen": "1751965891",
        "type": "seed"
      },
      {
        "item_id": "kiwi",
        "display_name": "Kiwi",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "10000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/kiwi",
        "description": "",
        "duration": "0",
        "last_seen": "1752163200",
        "type": "seed"
      },
      {
        "item_id": "lemon",
        "display_name": "Lemon",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/lemon",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "lime",
        "display_name": "Lime",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/lime",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "lingonberry",
        "display_name": "Lingonberry",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/lingonberry",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "loquat",
        "display_name": "Loquat",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "900000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/loquat",
        "description": "",
        "duration": "0",
        "last_seen": "1754438401",
        "type": "seed"
      },
      {
        "item_id": "mango",
        "display_name": "Mango",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/mango",
        "description": "",
        "duration": "0",
        "last_seen": "1756196402",
        "type": "seed"
      },
      {
        "item_id": "mangosteen",
        "display_name": "Mangosteen",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/mangosteen",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "maple_apple",
        "display_name": "Maple Apple",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/maple_apple",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "moon_melon",
        "display_name": "Moon Melon",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/moon_melon",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "nectarine",
        "display_name": "Nectarine",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/nectarine",
        "description": "",
        "duration": "0",
        "last_seen": "1751965891",
        "type": "seed"
      },
      {
        "item_id": "papaya",
        "display_name": "Papaya",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/papaya",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "passionfruit",
        "display_name": "Passionfruit",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/passionfruit",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "peach",
        "display_name": "Peach",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/peach",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "pear",
        "display_name": "Pear",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/pear",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "pineapple",
        "display_name": "Pineapple",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "7500",
        "icon": "https://api.joshlei.com/v2/growagarden/image/pineapple",
        "description": "",
        "duration": "0",
        "last_seen": "1756036803",
        "type": "seed"
      },
      {
        "item_id": "pricklefruit",
        "display_name": "Pricklefruit",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/pricklefruit",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "raspberry",
        "display_name": "Raspberry",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/raspberry",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "spiked_mango",
        "display_name": "Spiked Mango",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/spiked_mango",
        "description": "",
        "duration": "0",
        "last_seen": "1755234002",
        "type": "seed"
      },
      {
        "item_id": "starfruit",
        "display_name": "Starfruit",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/starfruit",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "strawberry",
        "display_name": "Strawberry",
        "rarity": "Common",
        "currency": "Sheckles",
        "price": "50",
        "icon": "https://api.joshlei.com/v2/growagarden/image/strawberry",
        "description": "",
        "duration": "0",
        "last_seen": "1756210502",
        "type": "seed"
      }
    ]
    const fungusPlants = [
      {
        "item_id": "duskpuff",
        "display_name": "Duskpuff",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/duskpuff",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "glowshroom",
        "display_name": "Glowshroom",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/glowshroom",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "horned_dinoshroom",
        "display_name": "Horned Dinoshroom",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/horned_dinoshroom",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "mushroom",
        "display_name": "Mushroom",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "150000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/mushroom",
        "description": "",
        "duration": "0",
        "last_seen": "1756198201",
        "type": "seed"
      },
      {
        "item_id": "nectarshade",
        "display_name": "Nectarshade",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/nectarshade",
        "description": "",
        "duration": "0",
        "last_seen": "1751965891",
        "type": "seed"
      },
      {
        "item_id": "sinisterdrip",
        "display_name": "Sinisterdrip",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/sinisterdrip",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      }
    ]
    const leafyPlants = [
      {
        "item_id": "aloe_vera",
        "display_name": "Aloe Vera",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/aloe_vera",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "apple",
        "display_name": "Apple",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "3250",
        "icon": "https://api.joshlei.com/v2/growagarden/image/apple",
        "description": "",
        "duration": "0",
        "last_seen": "1756210201",
        "type": "seed"
      },
      {
        "item_id": "artichoke",
        "display_name": "Artichoke",
        "rarity": "Uncommon",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/artichoke",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "beanstalk",
        "display_name": "Beanstalk",
        "rarity": "Prismatic",
        "currency": "Sheckles",
        "price": "10000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/beanstalk",
        "description": "",
        "duration": "0",
        "last_seen": "1756085701",
        "type": "seed"
      },
      {
        "item_id": "bee_balm",
        "display_name": "Bee Balm",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/bee_balm",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "blood_banana",
        "display_name": "Blood Banana",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/blood_banana",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "blueberry",
        "display_name": "Blueberry",
        "rarity": "Uncommon",
        "currency": "Sheckles",
        "price": "400",
        "icon": "https://api.joshlei.com/v2/growagarden/image/blueberry",
        "description": "",
        "duration": "0",
        "last_seen": "1756210502",
        "type": "seed"
      },
      {
        "item_id": "celestiberry",
        "display_name": "Celestiberry",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/celestiberry",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "cacao",
        "display_name": "Cacao",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "2500000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/cacao",
        "description": "",
        "duration": "0",
        "last_seen": "1756154701",
        "type": "seed"
      },
      {
        "item_id": "cantaloupe",
        "display_name": "Cantaloupe",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/cantaloupe",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "cauliflower",
        "display_name": "Cauliflower",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "1300",
        "icon": "https://api.joshlei.com/v2/growagarden/image/cauliflower",
        "description": "",
        "duration": "0",
        "last_seen": "1756209603",
        "type": "seed"
      },
      {
        "item_id": "cranberry",
        "display_name": "Cranberry",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/cranberry",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "cyclamen",
        "display_name": "Cyclamen",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/cyclamen",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "dragon_sapling",
        "display_name": "Dragon Sapling",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/dragon_sapling",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "eggplant",
        "display_name": "Eggplant",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/eggplant",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "elephant_ears",
        "display_name": "Elephant Ears",
        "rarity": "Prismatic",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/elephant_ears",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "firefly_fern",
        "display_name": "Firefly Fern",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/firefly_fern",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "foxglove",
        "display_name": "Foxglove",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/foxglove",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "giant_pinecone",
        "display_name": "Giant Pinecone",
        "rarity": "Prismatic",
        "currency": "Sheckles",
        "price": "55000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/giant_pinecone",
        "description": "",
        "duration": "0",
        "last_seen": "1756180803",
        "type": "seed"
      },
      {
        "item_id": "grand_tomato",
        "display_name": "Grand Tomato",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/grand_tomato",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "grape",
        "display_name": "Grape",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "850000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/grape",
        "description": "",
        "duration": "0",
        "last_seen": "1756196402",
        "type": "seed"
      },
      {
        "item_id": "green_apple",
        "display_name": "Green Apple",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "3500",
        "icon": "https://api.joshlei.com/v2/growagarden/image/green_apple",
        "description": "",
        "duration": "0",
        "last_seen": "1756209603",
        "type": "seed"
      },
      {
        "item_id": "hive_fruit",
        "display_name": "Hive Fruit",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/hive_fruit",
        "description": "",
        "duration": "0",
        "last_seen": "1751965891",
        "type": "seed"
      },
      {
        "item_id": "honeysuckle",
        "display_name": "Honeysuckle",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/honeysuckle",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "lilac",
        "display_name": "Lilac",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/lilac",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "lily_of_the_valley",
        "display_name": "Lily of the Valley",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/lily_of_the_valley",
        "description": "",
        "duration": "0",
        "last_seen": "1751711602",
        "type": "seed"
      },
      {
        "item_id": "log_pumpkin",
        "display_name": "Log Pumpkin",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/log_pumpkin",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "mandrake",
        "display_name": "Mandrake",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/mandrake",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "mango",
        "display_name": "Mango",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/mango",
        "description": "",
        "duration": "0",
        "last_seen": "1756196402",
        "type": "seed"
      },
      {
        "item_id": "mangosteen",
        "display_name": "Mangosteen",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/mangosteen",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "maple_apple",
        "display_name": "Maple Apple",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/maple_apple",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "mint",
        "display_name": "Mint",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/mint",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "moonflower",
        "display_name": "Moonflower",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/moonflower",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "moon_blossom",
        "display_name": "Moon Blossom",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/moon_blossom",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "moon_mango",
        "display_name": "Moon Mango",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/moon_mango",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "nectarine",
        "display_name": "Nectarine",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/nectarine",
        "description": "",
        "duration": "0",
        "last_seen": "1751965891",
        "type": "seed"
      },
      {
        "item_id": "noble_flower",
        "display_name": "Noble Flower",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/noble_flower",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "parasol_flower",
        "display_name": "Parasol Flower",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/parasol_flower",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "peach",
        "display_name": "Peach",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/peach",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "pineapple",
        "display_name": "Pineapple",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "7500",
        "icon": "https://api.joshlei.com/v2/growagarden/image/pineapple",
        "description": "",
        "duration": "0",
        "last_seen": "1756036803",
        "type": "seed"
      },
      {
        "item_id": "pink_lily",
        "display_name": "Pink Lily",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/pink_lily",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "pitcher_plant",
        "display_name": "Pitcher Plant",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "7500000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/pitcher_plant",
        "description": "",
        "duration": "0",
        "last_seen": "1755691203",
        "type": "seed"
      },
      {
        "item_id": "princess_thorn",
        "display_name": "Princess Thorn",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/princess_thorn",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "pumpkin",
        "display_name": "Pumpkin",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "3000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/pumpkin",
        "description": "",
        "duration": "0",
        "last_seen": "1756209902",
        "type": "seed"
      },
      {
        "item_id": "purple_dahlia",
        "display_name": "Purple Dahlia",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/purple_dahlia",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "rafflesia",
        "display_name": "Rafflesia",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "3200",
        "icon": "https://api.joshlei.com/v2/growagarden/image/rafflesia",
        "description": "",
        "duration": "0",
        "last_seen": "1756209603",
        "type": "seed"
      },
      {
        "item_id": "raspberry",
        "display_name": "Raspberry",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/raspberry",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "romanesco",
        "display_name": "Romanesco",
        "rarity": "Prismatic",
        "currency": "Sheckles",
        "price": "88000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/romanesco",
        "description": "",
        "duration": "0",
        "last_seen": "1755961892",
        "type": "seed"
      },
      {
        "item_id": "rose",
        "display_name": "Rose",
        "rarity": "Uncommon",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/rose",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "rosy_delight",
        "display_name": "Rosy Delight",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/rosy_delight",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "sakura_bush",
        "display_name": "Sakura Bush",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/sakura_bush",
        "description": "",
        "duration": "0",
        "last_seen": "1755313202",
        "type": "seed"
      },
      {
        "item_id": "serenity",
        "display_name": "Serenity",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/serenity",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "soft_sunshine",
        "display_name": "Soft Sunshine",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/soft_sunshine",
        "description": "",
        "duration": "0",
        "last_seen": "1755259201",
        "type": "seed"
      },
      {
        "item_id": "spiked_mango",
        "display_name": "Spiked Mango",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/spiked_mango",
        "description": "",
        "duration": "0",
        "last_seen": "1755234002",
        "type": "seed"
      },
      {
        "item_id": "starfruit",
        "display_name": "Starfruit",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/starfruit",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "strawberry",
        "display_name": "Strawberry",
        "rarity": "Common",
        "currency": "Sheckles",
        "price": "50",
        "icon": "https://api.joshlei.com/v2/growagarden/image/strawberry",
        "description": "",
        "duration": "0",
        "last_seen": "1756210502",
        "type": "seed"
      },
      {
        "item_id": "sugar_apple",
        "display_name": "Sugar Apple",
        "rarity": "Prismatic",
        "currency": "Sheckles",
        "price": "25000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/sugar_apple",
        "description": "",
        "duration": "0",
        "last_seen": "1756207201",
        "type": "seed"
      },
      {
        "item_id": "sunflower",
        "display_name": "Sunflower",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/sunflower",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "tomato",
        "display_name": "Tomato",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "800",
        "icon": "https://api.joshlei.com/v2/growagarden/image/tomato",
        "description": "",
        "duration": "0",
        "last_seen": "1756210502",
        "type": "seed"
      },
      {
        "item_id": "traveler's_fruit",
        "display_name": "Traveler's Fruit",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/traveler's_fruit",
        "description": "",
        "duration": "0",
        "last_seen": "1751634000",
        "type": "seed"
      },
      {
        "item_id": "twisted_tangle",
        "display_name": "Twisted Tangle",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/twisted_tangle",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "watermelon",
        "display_name": "Watermelon",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "2500",
        "icon": "https://api.joshlei.com/v2/growagarden/image/watermelon",
        "description": "",
        "duration": "0",
        "last_seen": "1756210201",
        "type": "seed"
      }
    ]
    const nightPlants = [
      {
        "item_id": "aura_flora",
        "display_name": "Aura Flora",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/aura_flora",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "blood_banana",
        "display_name": "Blood Banana",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/blood_banana",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "celestiberry",
        "display_name": "Celestiberry",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/celestiberry",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "gleamroot",
        "display_name": "Gleamroot",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/gleamroot",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "glowshroom",
        "display_name": "Glowshroom",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/glowshroom",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "mint",
        "display_name": "Mint",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/mint",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "moonflower",
        "display_name": "Moonflower",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/moonflower",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "moonglow",
        "display_name": "Moonglow",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/moonglow",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "moon_blossom",
        "display_name": "Moon Blossom",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/moon_blossom",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "moon_mango",
        "display_name": "Moon Mango",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/moon_mango",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "moon_melon",
        "display_name": "Moon Melon",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/moon_melon",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "nightshade",
        "display_name": "Nightshade",
        "rarity": "Uncommon",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/nightshade",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "starfruit",
        "display_name": "Starfruit",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/starfruit",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      }
    ]
    const prehistoricPlants = [
      {
        "item_id": "amber_spine",
        "display_name": "Amber Spine",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/amber_spine",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "boneboo",
        "display_name": "Boneboo",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/boneboo",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "bone_blossom",
        "display_name": "Bone Blossom",
        "rarity": "Transcendent",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/bone_blossom",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "firefly_fern",
        "display_name": "Firefly Fern",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/firefly_fern",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "fossilight",
        "display_name": "Fossilight",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/fossilight",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "horned_dinoshroom",
        "display_name": "Horned Dinoshroom",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/horned_dinoshroom",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "horsetail",
        "display_name": "Horsetail",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/horsetail",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "lingonberry",
        "display_name": "Lingonberry",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/lingonberry",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "grand_volcania",
        "display_name": "Grand Volcania",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/grand_volcania",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "paradise_petal",
        "display_name": "Paradise Petal",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/paradise_petal",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "stonebite",
        "display_name": "Stonebite",
        "rarity": "Uncommon",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/stonebite",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      }
    ]
    const pricklyPlants = [
      {
        "item_id": "aloe_vera",
        "display_name": "Aloe Vera",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/aloe_vera",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "cactus",
        "display_name": "Cactus",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "15000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/cactus",
        "description": "",
        "duration": "0",
        "last_seen": "1756204501",
        "type": "seed"
      },
      {
        "item_id": "celestiberry",
        "display_name": "Celestiberry",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/celestiberry",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "dragon_fruit",
        "display_name": "Dragon Fruit",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "50000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/dragon_fruit",
        "description": "",
        "duration": "0",
        "last_seen": "1756208702",
        "type": "seed"
      },
      {
        "item_id": "durian",
        "display_name": "Durian",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/durian",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "horned_dinoshroom",
        "display_name": "Horned Dinoshroom",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/horned_dinoshroom",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "nectar_thorn",
        "display_name": "Nectar Thorn",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/nectar_thorn",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "pineapple",
        "display_name": "Pineapple",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "7500",
        "icon": "https://api.joshlei.com/v2/growagarden/image/pineapple",
        "description": "",
        "duration": "0",
        "last_seen": "1756036803",
        "type": "seed"
      },
      {
        "item_id": "pricklefruit",
        "display_name": "Pricklefruit",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/pricklefruit",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "prickly_pear",
        "display_name": "Prickly Pear",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "555000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/prickly_pear",
        "description": "",
        "duration": "0",
        "last_seen": "1756180803",
        "type": "seed"
      },
      {
        "item_id": "princess_thorn",
        "display_name": "Princess Thorn",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/princess_thorn",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "spiked_mango",
        "display_name": "Spiked Mango",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/spiked_mango",
        "description": "",
        "duration": "0",
        "last_seen": "1755234002",
        "type": "seed"
      },
      {
        "item_id": "twisted_tangle",
        "display_name": "Twisted Tangle",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/twisted_tangle",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "venus_fly_trap",
        "display_name": "Venus Fly Trap",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/venus_fly_trap",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      }
    ]
    const rootPlants = [
      {
        "item_id": "carrot",
        "display_name": "Carrot",
        "rarity": "Common",
        "currency": "Sheckles",
        "price": "10",
        "icon": "https://api.joshlei.com/v2/growagarden/image/carrot",
        "description": "",
        "duration": "0",
        "last_seen": "1756210502",
        "type": "seed"
      },
      {
        "item_id": "chocolate_carrot",
        "display_name": "Chocolate Carrot",
        "rarity": "Common",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/chocolate_carrot",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "horsetail",
        "display_name": "Horsetail",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/horsetail",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "mandrake",
        "display_name": "Mandrake",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/mandrake",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "mutant_carrot",
        "display_name": "Mutant Carrot",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/mutant_carrot",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "onion",
        "display_name": "Onion",
        "rarity": "Uncommon",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/onion",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "potato",
        "display_name": "Potato",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/potato",
        "description": "",
        "duration": "0",
        "last_seen": "1692828912",
        "type": "seed"
      },
      {
        "item_id": "rhubarb",
        "display_name": "Rhubarb",
        "rarity": "Uncommon",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/rhubarb",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "taro_flower",
        "display_name": "Taro Flower",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/taro_flower",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "tall_asparagus",
        "display_name": "Tall Asparagus",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/tall_asparagus",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "wild_carrot",
        "display_name": "Wild Carrot",
        "rarity": "Uncommon",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/wild_carrot",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      }
    ]
    const sourPlants = [
      {
        "item_id": "cranberry",
        "display_name": "Cranberry",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/cranberry",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "lemon",
        "display_name": "Lemon",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/lemon",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "lime",
        "display_name": "Lime",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/lime",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "mangosteen",
        "display_name": "Mangosteen",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/mangosteen",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "passionfruit",
        "display_name": "Passionfruit",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/passionfruit",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "starfruit",
        "display_name": "Starfruit",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/starfruit",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      }
    ]
    const spicyPlants = [
      {
        "item_id": "badlands_pepper",
        "display_name": "Badlands Pepper",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/badlands_pepper",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "cacao",
        "display_name": "Cacao",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "2500000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/cacao",
        "description": "",
        "duration": "0",
        "last_seen": "1756154701",
        "type": "seed"
      },
      {
        "item_id": "cursed_fruit",
        "display_name": "Cursed Fruit",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/cursed_fruit",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "dragon_pepper",
        "display_name": "Dragon Pepper",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/dragon_pepper",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "ember_lily",
        "display_name": "Ember Lily",
        "rarity": "Prismatic",
        "currency": "Sheckles",
        "price": "15000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/ember_lily",
        "description": "",
        "duration": "0",
        "last_seen": "1756183204",
        "type": "seed"
      },
      {
        "item_id": "grand_volcania",
        "display_name": "Grand Volcania",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/grand_volcania",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "horned_dinoshroom",
        "display_name": "Horned Dinoshroom",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/horned_dinoshroom",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "jalapeno",
        "display_name": "Jalapeno",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/jalapeno",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "pepper",
        "display_name": "Pepper",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "1000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/pepper",
        "description": "",
        "duration": "0",
        "last_seen": "1756205403",
        "type": "seed"
      }
    ]
    const stalkyPlants = [
      {
        "item_id": "beanstalk",
        "display_name": "Beanstalk",
        "rarity": "Prismatic",
        "currency": "Sheckles",
        "price": "10000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/beanstalk",
        "description": "",
        "duration": "0",
        "last_seen": "1756085701",
        "type": "seed"
      },
      {
        "item_id": "burning_bud",
        "display_name": "Burning Bud",
        "rarity": "Prismatic",
        "currency": "Sheckles",
        "price": "40000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/burning_bud",
        "description": "",
        "duration": "0",
        "last_seen": "1756127701",
        "type": "seed"
      },
      {
        "item_id": "bamboo",
        "display_name": "Bamboo",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "4000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/bamboo",
        "description": "",
        "duration": "0",
        "last_seen": "1756210502",
        "type": "seed"
      },
      {
        "item_id": "bendboo",
        "display_name": "Bendboo",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/bendboo",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "dandelion",
        "display_name": "Dandelion",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/dandelion",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "elephant_ears",
        "display_name": "Elephant Ears",
        "rarity": "Prismatic",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/elephant_ears",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "firefly_fern",
        "display_name": "Firefly Fern",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/firefly_fern",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "grand_volcania",
        "display_name": "Grand Volcania",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/grand_volcania",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "hinomai",
        "display_name": "Hinomai",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/hinomai",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "horned_dinoshroom",
        "display_name": "Horned Dinoshroom",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/horned_dinoshroom",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "lily_of_the_valley",
        "display_name": "Lily of the Valley",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/lily_of_the_valley",
        "description": "",
        "duration": "0",
        "last_seen": "1751711602",
        "type": "seed"
      },
      {
        "item_id": "lucky_bamboo",
        "display_name": "Lucky Bamboo",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/lucky_bamboo",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "lotus",
        "display_name": "Lotus",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/lotus",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "mushroom",
        "display_name": "Mushroom",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "150000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/mushroom",
        "description": "",
        "duration": "0",
        "last_seen": "1756198201",
        "type": "seed"
      },
      {
        "item_id": "mutant_carrot",
        "display_name": "Mutant Carrot",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/mutant_carrot",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "pitcher_plant",
        "display_name": "Pitcher Plant",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "7500000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/pitcher_plant",
        "description": "",
        "duration": "0",
        "last_seen": "1755691203",
        "type": "seed"
      },
      {
        "item_id": "poseidon_plant",
        "display_name": "Poseidon Plant",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/poseidon_plant",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "pricklefruit",
        "display_name": "Pricklefruit",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/pricklefruit",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "sinisterdrip",
        "display_name": "Sinisterdrip",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/sinisterdrip",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "soft_sunshine",
        "display_name": "Soft Sunshine",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/soft_sunshine",
        "description": "",
        "duration": "0",
        "last_seen": "1755259201",
        "type": "seed"
      },
      {
        "item_id": "spring_onion",
        "display_name": "Spring Onion",
        "rarity": "Common",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/spring_onion",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "stonebite",
        "display_name": "Stonebite",
        "rarity": "Uncommon",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/stonebite",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "sugarglaze",
        "display_name": "Sugarglaze",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/sugarglaze",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "tall_asparagus",
        "display_name": "Tall Asparagus",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/tall_asparagus",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "veinpetal",
        "display_name": "Veinpetal",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/veinpetal",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      }
    ]
    const summerPlants = [
      {
        "item_id": "aloe_vera",
        "display_name": "Aloe Vera",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/aloe_vera",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "avocado",
        "display_name": "Avocado",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "5000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/avocado",
        "description": "",
        "duration": "0",
        "last_seen": "1756180803",
        "type": "seed"
      },
      {
        "item_id": "banana",
        "display_name": "Banana",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "7000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/banana",
        "description": "",
        "duration": "0",
        "last_seen": "1756051206",
        "type": "seed"
      },
      {
        "item_id": "bell_pepper",
        "display_name": "Bell Pepper",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "55000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/bell_pepper",
        "description": "",
        "duration": "0",
        "last_seen": "1756022493",
        "type": "seed"
      },
      {
        "item_id": "blueberry",
        "display_name": "Blueberry",
        "rarity": "Uncommon",
        "currency": "Sheckles",
        "price": "400",
        "icon": "https://api.joshlei.com/v2/growagarden/image/blueberry",
        "description": "",
        "duration": "0",
        "last_seen": "1756210502",
        "type": "seed"
      },
      {
        "item_id": "butternut_squash",
        "display_name": "Butternut Squash",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/butternut_squash",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "cantaloupe",
        "display_name": "Cantaloupe",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/cantaloupe",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "carrot",
        "display_name": "Carrot",
        "rarity": "Common",
        "currency": "Sheckles",
        "price": "10",
        "icon": "https://api.joshlei.com/v2/growagarden/image/carrot",
        "description": "",
        "duration": "0",
        "last_seen": "1756210502",
        "type": "seed"
      },
      {
        "item_id": "cauliflower",
        "display_name": "Cauliflower",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "1300",
        "icon": "https://api.joshlei.com/v2/growagarden/image/cauliflower",
        "description": "",
        "duration": "0",
        "last_seen": "1756209603",
        "type": "seed"
      },
      {
        "item_id": "delphinium",
        "display_name": "Delphinium",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/delphinium",
        "description": "",
        "duration": "0",
        "last_seen": "1752544979",
        "type": "seed"
      },
      {
        "item_id": "elephant_ears",
        "display_name": "Elephant Ears",
        "rarity": "Prismatic",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/elephant_ears",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "feijoa",
        "display_name": "Feijoa",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "2750000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/feijoa",
        "description": "",
        "duration": "0",
        "last_seen": "1751803201",
        "type": "seed"
      },
      {
        "item_id": "green_apple",
        "display_name": "Green Apple",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "3500",
        "icon": "https://api.joshlei.com/v2/growagarden/image/green_apple",
        "description": "",
        "duration": "0",
        "last_seen": "1756209603",
        "type": "seed"
      },
      {
        "item_id": "guanabana",
        "display_name": "Guanabana",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/guanabana",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "kiwi",
        "display_name": "Kiwi",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "10000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/kiwi",
        "description": "",
        "duration": "0",
        "last_seen": "1752163200",
        "type": "seed"
      },
      {
        "item_id": "lily_of_the_valley",
        "display_name": "Lily of the Valley",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/lily_of_the_valley",
        "description": "",
        "duration": "0",
        "last_seen": "1751711602",
        "type": "seed"
      },
      {
        "item_id": "loquat",
        "display_name": "Loquat",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "900000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/loquat",
        "description": "",
        "duration": "0",
        "last_seen": "1754438401",
        "type": "seed"
      },
      {
        "item_id": "parasol_flower",
        "display_name": "Parasol Flower",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/parasol_flower",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "peace_lily",
        "display_name": "Peace Lily",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/peace_lily",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "pear",
        "display_name": "Pear",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/pear",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "pineapple",
        "display_name": "Pineapple",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "7500",
        "icon": "https://api.joshlei.com/v2/growagarden/image/pineapple",
        "description": "",
        "duration": "0",
        "last_seen": "1756036803",
        "type": "seed"
      },
      {
        "item_id": "pitcher_plant",
        "display_name": "Pitcher Plant",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "7500000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/pitcher_plant",
        "description": "",
        "duration": "0",
        "last_seen": "1755691203",
        "type": "seed"
      },
      {
        "item_id": "prickly_pear",
        "display_name": "Prickly Pear",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "555000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/prickly_pear",
        "description": "",
        "duration": "0",
        "last_seen": "1756180803",
        "type": "seed"
      },
      {
        "item_id": "rafflesia",
        "display_name": "Rafflesia",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "3200",
        "icon": "https://api.joshlei.com/v2/growagarden/image/rafflesia",
        "description": "",
        "duration": "0",
        "last_seen": "1756209603",
        "type": "seed"
      },
      {
        "item_id": "rosy_delight",
        "display_name": "Rosy Delight",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/rosy_delight",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "strawberry",
        "display_name": "Strawberry",
        "rarity": "Common",
        "currency": "Sheckles",
        "price": "50",
        "icon": "https://api.joshlei.com/v2/growagarden/image/strawberry",
        "description": "",
        "duration": "0",
        "last_seen": "1756210502",
        "type": "seed"
      },
      {
        "item_id": "sugar_apple",
        "display_name": "Sugar Apple",
        "rarity": "Prismatic",
        "currency": "Sheckles",
        "price": "25000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/sugar_apple",
        "description": "",
        "duration": "0",
        "last_seen": "1756207201",
        "type": "seed"
      },
      {
        "item_id": "tomato",
        "display_name": "Tomato",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "800",
        "icon": "https://api.joshlei.com/v2/growagarden/image/tomato",
        "description": "",
        "duration": "0",
        "last_seen": "1756210502",
        "type": "seed"
      },
      {
        "item_id": "traveler's_fruit",
        "display_name": "Traveler's Fruit",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/traveler's_fruit",
        "description": "",
        "duration": "0",
        "last_seen": "1751634000",
        "type": "seed"
      },
      {
        "item_id": "watermelon",
        "display_name": "Watermelon",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "2500",
        "icon": "https://api.joshlei.com/v2/growagarden/image/watermelon",
        "description": "",
        "duration": "0",
        "last_seen": "1756210201",
        "type": "seed"
      },
      {
        "item_id": "wild_carrot",
        "display_name": "Wild Carrot",
        "rarity": "Uncommon",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/wild_carrot",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      }
    ]
    const sweetPlants = [
      {
        "item_id": "banana",
        "display_name": "Banana",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "7000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/banana",
        "description": "",
        "duration": "0",
        "last_seen": "1756051206",
        "type": "seed"
      },
      {
        "item_id": "blueberry",
        "display_name": "Blueberry",
        "rarity": "Uncommon",
        "currency": "Sheckles",
        "price": "400",
        "icon": "https://api.joshlei.com/v2/growagarden/image/blueberry",
        "description": "",
        "duration": "0",
        "last_seen": "1756210502",
        "type": "seed"
      },
      {
        "item_id": "canary_melon",
        "display_name": "Canary Melon",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/canary_melon",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "candy_blossom",
        "display_name": "Candy Blossom",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/candy_blossom",
        "description": "",
        "duration": "0",
        "last_seen": "1752040320",
        "type": "seed"
      },
      {
        "item_id": "candy_sunflower",
        "display_name": "Candy Sunflower",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/candy_sunflower",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "chocolate_carrot",
        "display_name": "Chocolate Carrot",
        "rarity": "Common",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/chocolate_carrot",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "crown_melon",
        "display_name": "Crown Melon",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/crown_melon",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "easter_egg",
        "display_name": "Easter Egg",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/easter_egg",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "grape",
        "display_name": "Grape",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "850000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/grape",
        "description": "",
        "duration": "0",
        "last_seen": "1756196402",
        "type": "seed"
      },
      {
        "item_id": "mango",
        "display_name": "Mango",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/mango",
        "description": "",
        "duration": "0",
        "last_seen": "1756196402",
        "type": "seed"
      },
      {
        "item_id": "mangosteen",
        "display_name": "Mangosteen",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/mangosteen",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "moon_melon",
        "display_name": "Moon Melon",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/moon_melon",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "nectar_thorn",
        "display_name": "Nectar Thorn",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/nectar_thorn",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "peach",
        "display_name": "Peach",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/peach",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "pear",
        "display_name": "Pear",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/pear",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "pineapple",
        "display_name": "Pineapple",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "7500",
        "icon": "https://api.joshlei.com/v2/growagarden/image/pineapple",
        "description": "",
        "duration": "0",
        "last_seen": "1756036803",
        "type": "seed"
      },
      {
        "item_id": "raspberry",
        "display_name": "Raspberry",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/raspberry",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "red_lollipop",
        "display_name": "Red Lollipop",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/red_lollipop",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "romanesco",
        "display_name": "Romanesco",
        "rarity": "Prismatic",
        "currency": "Sheckles",
        "price": "88000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/romanesco",
        "description": "",
        "duration": "0",
        "last_seen": "1755961892",
        "type": "seed"
      },
      {
        "item_id": "spiked_mango",
        "display_name": "Spiked Mango",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/spiked_mango",
        "description": "",
        "duration": "0",
        "last_seen": "1755234002",
        "type": "seed"
      },
      {
        "item_id": "starfruit",
        "display_name": "Starfruit",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/starfruit",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "strawberry",
        "display_name": "Strawberry",
        "rarity": "Common",
        "currency": "Sheckles",
        "price": "50",
        "icon": "https://api.joshlei.com/v2/growagarden/image/strawberry",
        "description": "",
        "duration": "0",
        "last_seen": "1756210502",
        "type": "seed"
      },
      {
        "item_id": "sugarglaze",
        "display_name": "Sugarglaze",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/sugarglaze",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "sugar_apple",
        "display_name": "Sugar Apple",
        "rarity": "Prismatic",
        "currency": "Sheckles",
        "price": "25000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/sugar_apple",
        "description": "",
        "duration": "0",
        "last_seen": "1756207201",
        "type": "seed"
      },
      {
        "item_id": "watermelon",
        "display_name": "Watermelon",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "2500",
        "icon": "https://api.joshlei.com/v2/growagarden/image/watermelon",
        "description": "",
        "duration": "0",
        "last_seen": "1756210201",
        "type": "seed"
      }
    ]
    const toxicPlants = [
      {
        "item_id": "amber_spine",
        "display_name": "Amber Spine",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/amber_spine",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "cursed_fruit",
        "display_name": "Cursed Fruit",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/cursed_fruit",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "horned_dinoshroom",
        "display_name": "Horned Dinoshroom",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/horned_dinoshroom",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "foxglove",
        "display_name": "Foxglove",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/foxglove",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "nightshade",
        "display_name": "Nightshade",
        "rarity": "Uncommon",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/nightshade",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "pitcher_plant",
        "display_name": "Pitcher Plant",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "7500000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/pitcher_plant",
        "description": "",
        "duration": "0",
        "last_seen": "1755691203",
        "type": "seed"
      },
      {
        "item_id": "rafflesia",
        "display_name": "Rafflesia",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "3200",
        "icon": "https://api.joshlei.com/v2/growagarden/image/rafflesia",
        "description": "",
        "duration": "0",
        "last_seen": "1756209603",
        "type": "seed"
      },
      {
        "item_id": "sinisterdrip",
        "display_name": "Sinisterdrip",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/sinisterdrip",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      }
    ]
    const tropicalFruitPlants = [
      {
        "item_id": "banana",
        "display_name": "Banana",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "7000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/banana",
        "description": "",
        "duration": "0",
        "last_seen": "1756051206",
        "type": "seed"
      },
      {
        "item_id": "coconut",
        "display_name": "Coconut",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "6000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/coconut",
        "description": "",
        "duration": "0",
        "last_seen": "1756208401",
        "type": "seed"
      },
      {
        "item_id": "cocovine",
        "display_name": "Cocovine",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/cocovine",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "dragon_fruit",
        "display_name": "Dragon Fruit",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "50000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/dragon_fruit",
        "description": "",
        "duration": "0",
        "last_seen": "1756208702",
        "type": "seed"
      },
      {
        "item_id": "durian",
        "display_name": "Durian",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/durian",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "honeysuckle",
        "display_name": "Honeysuckle",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/honeysuckle",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "mango",
        "display_name": "Mango",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/mango",
        "description": "",
        "duration": "0",
        "last_seen": "1756196402",
        "type": "seed"
      },
      {
        "item_id": "papaya",
        "display_name": "Papaya",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/papaya",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "parasol_flower",
        "display_name": "Parasol Flower",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/parasol_flower",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "passionfruit",
        "display_name": "Passionfruit",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/passionfruit",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "pineapple",
        "display_name": "Pineapple",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "7500",
        "icon": "https://api.joshlei.com/v2/growagarden/image/pineapple",
        "description": "",
        "duration": "0",
        "last_seen": "1756036803",
        "type": "seed"
      },
      {
        "item_id": "pitcher_plant",
        "display_name": "Pitcher Plant",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "7500000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/pitcher_plant",
        "description": "",
        "duration": "0",
        "last_seen": "1755691203",
        "type": "seed"
      },
      {
        "item_id": "starfruit",
        "display_name": "Starfruit",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/starfruit",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "traveler's_fruit",
        "display_name": "Traveler's Fruit",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/traveler's_fruit",
        "description": "",
        "duration": "0",
        "last_seen": "1751634000",
        "type": "seed"
      },
      {
        "item_id": "watermelon",
        "display_name": "Watermelon",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "2500",
        "icon": "https://api.joshlei.com/v2/growagarden/image/watermelon",
        "description": "",
        "duration": "0",
        "last_seen": "1756210201",
        "type": "seed"
      }
    ]
     const vegetablePlants = [
      {
        "item_id": "artichoke",
        "display_name": "Artichoke",
        "rarity": "Uncommon",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/artichoke",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "badlands_pepper",
        "display_name": "Badlands Pepper",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/badlands_pepper",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "beanstalk",
        "display_name": "Beanstalk",
        "rarity": "Prismatic",
        "currency": "Sheckles",
        "price": "10000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/beanstalk",
        "description": "",
        "duration": "0",
        "last_seen": "1756085701",
        "type": "seed"
      },
      {
        "item_id": "bell_pepper",
        "display_name": "Bell Pepper",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "55000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/bell_pepper",
        "description": "",
        "duration": "0",
        "last_seen": "1756022493",
        "type": "seed"
      },
      {
        "item_id": "bitter_melon",
        "display_name": "Bitter Melon",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/bitter_melon",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "carrot",
        "display_name": "Carrot",
        "rarity": "Common",
        "currency": "Sheckles",
        "price": "10",
        "icon": "https://api.joshlei.com/v2/growagarden/image/carrot",
        "description": "",
        "duration": "0",
        "last_seen": "1756210502",
        "type": "seed"
      },
      {
        "item_id": "cauliflower",
        "display_name": "Cauliflower",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "1300",
        "icon": "https://api.joshlei.com/v2/growagarden/image/cauliflower",
        "description": "",
        "duration": "0",
        "last_seen": "1756209603",
        "type": "seed"
      },
      {
        "item_id": "chocolate_carrot",
        "display_name": "Chocolate Carrot",
        "rarity": "Common",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/chocolate_carrot",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "corn",
        "display_name": "Corn",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "1300",
        "icon": "https://api.joshlei.com/v2/growagarden/image/corn",
        "description": "",
        "duration": "0",
        "last_seen": "1756210502",
        "type": "seed"
      },
      {
        "item_id": "dragon_pepper",
        "display_name": "Dragon Pepper",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/dragon_pepper",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "eggplant",
        "display_name": "Eggplant",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/eggplant",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "grand_tomato",
        "display_name": "Grand Tomato",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/grand_tomato",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "jalapeno",
        "display_name": "Jalapeno",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/jalapeno",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "king_cabbage",
        "display_name": "King Cabbage",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/king_cabbage",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "log_pumpkin",
        "display_name": "Log Pumpkin",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/log_pumpkin",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "mandrake",
        "display_name": "Mandrake",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/mandrake",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "mutant_carrot",
        "display_name": "Mutant Carrot",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/mutant_carrot",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "mint",
        "display_name": "Mint",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/mint",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "onion",
        "display_name": "Onion",
        "rarity": "Uncommon",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/onion",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "pepper",
        "display_name": "Pepper",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "1000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/pepper",
        "description": "",
        "duration": "0",
        "last_seen": "1756205403",
        "type": "seed"
      },
      {
        "item_id": "pumpkin",
        "display_name": "Pumpkin",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "3000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/pumpkin",
        "description": "",
        "duration": "0",
        "last_seen": "1756209902",
        "type": "seed"
      },
      {
        "item_id": "purple_cabbage",
        "display_name": "Purple Cabbage",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/purple_cabbage",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "romanesco",
        "display_name": "Romanesco",
        "rarity": "Prismatic",
        "currency": "Sheckles",
        "price": "88000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/romanesco",
        "description": "",
        "duration": "0",
        "last_seen": "1755961892",
        "type": "seed"
      },
      {
        "item_id": "rhubarb",
        "display_name": "Rhubarb",
        "rarity": "Uncommon",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/rhubarb",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "tall_asparagus",
        "display_name": "Tall Asparagus",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/tall_asparagus",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "taro_flower",
        "display_name": "Taro Flower",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/taro_flower",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "tomato",
        "display_name": "Tomato",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "800",
        "icon": "https://api.joshlei.com/v2/growagarden/image/tomato",
        "description": "",
        "duration": "0",
        "last_seen": "1756210502",
        "type": "seed"
      },
      {
        "item_id": "violet_corn",
        "display_name": "Violet Corn",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/violet_corn",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "wild_carrot",
        "display_name": "Wild Carrot",
        "rarity": "Uncommon",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/wild_carrot",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      }
    ]
    const woodyPlants = [
      {
        "item_id": "amberheart",
        "display_name": "Amberheart",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/amberheart",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "apple",
        "display_name": "Apple",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "3250",
        "icon": "https://api.joshlei.com/v2/growagarden/image/apple",
        "description": "",
        "duration": "0",
        "last_seen": "1756210201",
        "type": "seed"
      },
      {
        "item_id": "avocado",
        "display_name": "Avocado",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "5000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/avocado",
        "description": "",
        "duration": "0",
        "last_seen": "1756180803",
        "type": "seed"
      },
      {
        "item_id": "cacao",
        "display_name": "Cacao",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "2500000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/cacao",
        "description": "",
        "duration": "0",
        "last_seen": "1756154701",
        "type": "seed"
      },
      {
        "item_id": "coconut",
        "display_name": "Coconut",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "6000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/coconut",
        "description": "",
        "duration": "0",
        "last_seen": "1756208401",
        "type": "seed"
      },
      {
        "item_id": "cocovine",
        "display_name": "Cocovine",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/cocovine",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "dragon_sapling",
        "display_name": "Dragon Sapling",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/dragon_sapling",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "durian",
        "display_name": "Durian",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/durian",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "duskpuff",
        "display_name": "Duskpuff",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/duskpuff",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "feijoa",
        "display_name": "Feijoa",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "2750000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/feijoa",
        "description": "",
        "duration": "0",
        "last_seen": "1751803201",
        "type": "seed"
      },
      {
        "item_id": "giant_pinecone",
        "display_name": "Giant Pinecone",
        "rarity": "Prismatic",
        "currency": "Sheckles",
        "price": "55000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/giant_pinecone",
        "description": "",
        "duration": "0",
        "last_seen": "1756180803",
        "type": "seed"
      },
      {
        "item_id": "gleamroot",
        "display_name": "Gleamroot",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/gleamroot",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "hive_fruit",
        "display_name": "Hive Fruit",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/hive_fruit",
        "description": "",
        "duration": "0",
        "last_seen": "1751965891",
        "type": "seed"
      },
      {
        "item_id": "kiwi",
        "display_name": "Kiwi",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "10000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/kiwi",
        "description": "",
        "duration": "0",
        "last_seen": "1752163200",
        "type": "seed"
      },
      {
        "item_id": "maple_apple",
        "display_name": "Maple Apple",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/maple_apple",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "mango",
        "display_name": "Mango",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/mango",
        "description": "",
        "duration": "0",
        "last_seen": "1756196402",
        "type": "seed"
      },
      {
        "item_id": "mangosteen",
        "display_name": "Mangosteen",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/mangosteen",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "moon_blossom",
        "display_name": "Moon Blossom",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/moon_blossom",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "moon_mango",
        "display_name": "Moon Mango",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/moon_mango",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "nectarine",
        "display_name": "Nectarine",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/nectarine",
        "description": "",
        "duration": "0",
        "last_seen": "1751965891",
        "type": "seed"
      },
      {
        "item_id": "papaya",
        "display_name": "Papaya",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/papaya",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "peach",
        "display_name": "Peach",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/peach",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "pear",
        "display_name": "Pear",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/pear",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "rhubarb",
        "display_name": "Rhubarb",
        "rarity": "Uncommon",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/rhubarb",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "sakura_bush",
        "display_name": "Sakura Bush",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/sakura_bush",
        "description": "",
        "duration": "0",
        "last_seen": "1755313202",
        "type": "seed"
      },
      {
        "item_id": "spiked_mango",
        "display_name": "Spiked Mango",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/spiked_mango",
        "description": "",
        "duration": "0",
        "last_seen": "1755234002",
        "type": "seed"
      },
      {
        "item_id": "traveler's_fruit",
        "display_name": "Traveler's Fruit",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/traveler's_fruit",
        "description": "",
        "duration": "0",
        "last_seen": "1751634000",
        "type": "seed"
      }
    ]
    const zenPlants = [
      {
        "item_id": "dezen",
        "display_name": "Dezen",
        "rarity": "Uncommon",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/dezen",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "enkaku",
        "display_name": "Enkaku",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/enkaku",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "hinomai",
        "display_name": "Hinomai",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/hinomai",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "lucky_bamboo",
        "display_name": "Lucky Bamboo",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/lucky_bamboo",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "maple_apple",
        "display_name": "Maple Apple",
        "rarity": "Divine",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/maple_apple",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "monoblooma",
        "display_name": "Monoblooma",
        "rarity": "Uncommon",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/monoblooma",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "sakura_bush",
        "display_name": "Sakura Bush",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/sakura_bush",
        "description": "",
        "duration": "0",
        "last_seen": "1755313202",
        "type": "seed"
      },
      {
        "item_id": "serenity",
        "display_name": "Serenity",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/serenity",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "soft_sunshine",
        "display_name": "Soft Sunshine",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/soft_sunshine",
        "description": "",
        "duration": "0",
        "last_seen": "1755259201",
        "type": "seed"
      },
      {
        "item_id": "spiked_mango",
        "display_name": "Spiked Mango",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/spiked_mango",
        "description": "",
        "duration": "0",
        "last_seen": "1755234002",
        "type": "seed"
      },
      {
        "item_id": "taro_flower",
        "display_name": "Taro Flower",
        "rarity": "Legendary",
        "currency": "Sheckles",
        "price": "100000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/taro_flower",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "tranquil_bloom",
        "display_name": "Tranquil Bloom",
        "rarity": "Prismatic",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/tranquil_bloom",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      },
      {
        "item_id": "zenflare",
        "display_name": "Zenflare",
        "rarity": "Rare",
        "currency": "Sheckles",
        "price": "100000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/zenflare",
        "description": "",
        "duration": "0",
        "last_seen": "1755313202",
        "type": "seed"
      },
      {
        "item_id": "zen_rocks",
        "display_name": "Zen Rocks",
        "rarity": "Mythical",
        "currency": "Sheckles",
        "price": "100000000000000000",
        "icon": "https://api.joshlei.com/v2/growagarden/image/zen_rocks",
        "description": "",
        "duration": "0",
        "last_seen": "0",
        "type": "seed"
      }
    ]

// categoriesData (all 20 categories, items are display-name strings)
const categoriesData = [
  {
    id: "berry",
    title: "Berry Plants",
    description: "Berry-type plants.",
    items: berryPlants
  },
  {
    id: "candy",
    title: "Candy Plants",
    description: "Candy / confection-themed plants.",
    items: candyPlants 
  },
  {
    id: "flower",
    title: "Flower Plants",
    description: "Flower-type plants (many).",
    items: flowerPlants 
  },
  {
    id: "fruit",
    title: "Fruit Plants",
    description: "Fruit-producing plants (examples).",
    items: fruitsPlants
  },
  {
    id: "fungus",
    title: "Fungus Plants",
    description: "Mushrooms and fungus-type plants.",
    items: fungusPlants 
  },
  {
    id: "leafy",
    title: "Leafy Plants",
    description: "Leafy plants and herbs (wide variety).",
    items: leafyPlants 
  },
  {
    id: "night",
    title: "Night Plants",
    description: "Moon/night-themed plants.",
    items: nightPlants 
  },
  {
    id: "prehistoric",
    title: "Prehistoric Plants",
    description: "Prehistoric / ancient plants.",
    items: prehistoricPlants
  },
  {
    id: "prickly",
    title: "Prickly Plants",
    description: "Cacti, spiky and thorny plants.",
    items: pricklyPlants 
  },
  {
    id: "root",
    title: "Root Plants",
    description: "Root vegetables & tubers.",
    items: rootPlants 
  },
  {
    id: "sour",
    title: "Sour Plants",
    description: "Sour-flavored plants.",
    items: sourPlants
  },
  {
    id: "spicy",
    title: "Spicy Plants",
    description: "Hot & spicy plants.",
    items: spicyPlants
  },
  {
    id: "stalky",
    title: "Stalky Plants",
    description: "Tall/stalky plants.",
    items: stalkyPlants
  },
  {
    id: "summer",
    title: "Summer Plants",
    description: "Plants associated with summer.",
    items: summerPlants 
  },
  {
    id: "sweet",
    title: "Sweet Plants",
    description: "Sweet-flavored plants.",
    items: sweetPlants 
  },
  {
    id: "toxic",
    title: "Toxic Plants",
    description: "Toxic/poisonous plants.",
    items: toxicPlants
  },
  {
    id: "tropical-fruit",
    title: "Tropical Fruit Plants",
    description: "Tropical fruit plants.",
    items: tropicalFruitPlants
  },
  {
    id: "vegetable",
    title: "Vegetable Plants",
    description: "Vegetables & crop plants.",
    items: 
     vegetablePlants
    
  },
  {
    id: "woody",
    title: "Woody Plants",
    description: "Woody plants and trees.",
    items: woodyPlants
  },
  {
    id: "zen",
    title: "Zen Plants",
    description: "Zen-themed plants.",
    items: zenPlants
  }
];

// ---------- helper to map display-name strings to full plant objects ----------
/**
 * mapCategoriesToPlants(plants, categories)
 *  - plants: array of plant objects (from plantsData.json)
 *  - categories: categoriesData (above)
 *
 * returns: new array of categories where each category.items is an array of matched plant objects
 * if a name wasn't found, an entry { missingName: "Original Name" } will appear in that category for clarity.
 */
function normalizeName(s) {
  if (!s) return "";
  const noDiacritics = s.normalize ? s.normalize("NFD").replace(/[\u0300-\u036f]/g, "") : s;
  return noDiacritics
    .toLowerCase()
    .replace(/[\u2019'’`"]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function mapCategoriesToPlants(plants, categories) {
  // build lookup map of normalized display_name -> plant object(s)
  const map = new Map();
  for (const p of plants) {
    const key = normalizeName(p.display_name || p.item_id || "");
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(p);
  }

  // result categories copy
  const out = categories.map(cat => ({ ...cat, items: [] }));

  for (const cat of out) {
    for (const nameStr of cat.items /* current items are strings */) {
      const target = normalizeName(nameStr);
      let matched = false;

      // 1) exact normalized match
      if (map.has(target)) {
        out.find(c => c.id === cat.id).items.push(...map.get(target));
        matched = true;
        continue;
      }

      // 2) whole-word match (works for "Apple" matching "Green Apple")
      const re = new RegExp(`\\b${target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      for (const [k, arr] of map.entries()) {
        if (re.test(k)) {
          out.find(c => c.id === cat.id).items.push(...arr);
          matched = true;
        }
      }

      // 3) substring fallback
      if (!matched) {
        for (const [k, arr] of map.entries()) {
          if (k.includes(target) || target.includes(k)) {
            out.find(c => c.id === cat.id).items.push(...arr);
            matched = true;
          }
        }
      }

      // 4) still not matched => mark missing
      if (!matched) {
        out.find(c => c.id === cat.id).items.push({ missingName: nameStr });
      }
    }

    // deduplicate by item_id/display_name
    const dedup = [];
    const seen = new Set();
    for (const itm of out.find(c => c.id === cat.id).items) {
      const key = itm.item_id || itm.display_name || JSON.stringify(itm);
      if (!seen.has(key)) {
        seen.add(key);
        dedup.push(itm);
      }
    }
    out.find(c => c.id === cat.id).items = dedup;
  }

  return out;
}

/* Example usage in Node or Browser (if you import plantsData):
// Node: const plants = require('./plantsData.json');
// const fullCategories = mapCategoriesToPlants(plants, categoriesData);
// console.log(fullCategories);
*/


export default function PlantsCategories() {
  const [categories] = useState(categoriesData);
  const [selectedCategory, setSelectedCategory] = useState(categories[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const current = categories.find((c) => c.id === selectedCategory);

  // small UX loading when switching categories
  useEffect(() => {
    setIsLoading(true);
    const t = setTimeout(() => setIsLoading(false), 120);
    return () => clearTimeout(t);
  }, [selectedCategory]);

  // CSS variables / palette:
  // --bg: #0a192f (user)
  // --primary: accent (teal)
  // --slate: muted text
  // --lightest-slate: heading / bright text
  // --light-navy: slightly lighter than bg for cards
  // --card-border: border color for cards
  const paletteStyle = {
    "--bg": "#0a192f",
    "--primary": "#64ffda",
    "--slate": "#8892b0",
    "--lightest-slate": "#ccd6f6",
    "--light-navy": "#112240",
    "--card-bg": "#071428",
    "--card-border": "#102a3a",
    //  body: '#0a192f',
    //     primary: '#64ffda',
    //     LightNavy: '#112240',
    //     LightestNavy:	'#233554',
    //     Slate: '#8892b0',
    //     LightSlate:	'#a8b2d1',
    //     LightestSlate: 	'#ccd6f6',
    //     White: '#e6f1ff'
  };

  return (
    <section
      id="plants"
      className="min-h-screen py-12 md:py-20 bg-[#0a192f] text-[#ccd6f6]"
      style={{ ...paletteStyle }}
    >
      <div className="">
        <div className="mb-8">
        <Heading headingText={"Plant Types"} />
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Category list */}
          <div className="md:w-56 w-full ">
            {/* Desktop vertical list */}
            <div
              className="hidden md:block rounded-md border shadow-sm   overflow-auto  custom-scrollbar  max-h-[500px]"
              style={{ backgroundColor: "transparent", borderColor: "var(--card-border)" }}
            >
              {categories.map((cat) => {
                const active = cat.id === selectedCategory;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left px-4 py-3 border-b last:border-b-0 transition-colors duration-150 flex items-center gap-3`}
                    style={{
                      backgroundColor: active ? "rgba(100,255,218,0.06)" : "transparent",
                      color: active ? "#64ffda" : "#ccd6f6",
                      borderColor: "#102a3a",
                    }}
                  >
                    <span className="flex-1">{cat.title}</span>
                    <span style={{ color: "#8892b0" }} className="text-xs">
                      {cat.items?.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Mobile horizontal scroll list */}
            <div className="md:hidden overflow-x-auto custom-scrollbar ">
              <div className="flex gap-3 pb-4">
                {categories.map((cat) => {
                  const active = cat.id === selectedCategory;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex-shrink-0 sm:px-4 sm:py-2 p-1 text-xs rounded-md border transition-all duration-150 cursor-pointer`}
                      style={{
                        backgroundColor: active ? "#64ffda" : "transparent",
                        color: active ? "#001219" : "#ccd6f6",
                        borderColor: active ? "transparent" : "rgba(255,255,255,0.06)",
                      }}
                    >
                      {cat.title}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* category description (desktop) */}
            <div className="hidden md:block mt-4 text-sm px-3">
              <p style={{ color: "#8892b0" }}>{current?.description}</p>
            </div>
          </div>

          {/* Content area */}
          <div
            className="flex-1 rounded-md border p-4 min-h-[280px] overflow-y-auto overflow-x-hidden custom-scrollbar max-h-[600px]"
            style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
          >
            {isLoading ? (
              <div className="w-full h-56 flex items-center justify-center">
                <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24" fill="none" style={{ color: "#64ffda" }}>
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-medium" style={{ color: "#ccd6f6" }}>
                      {current?.title}
                    </h3>
                   
                  </div>
                  <div className="">
                    <p className="text-sm" style={{ color: "#8892b0" }}>
                      {current?.items.length} plant(s)
                    </p>
                  </div>
                </div>

                {/* Grid of plant cards (ONLY image, name and rarity) */}
                {current && current.items.length > 0 ? (
                  <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-1 sm:gap-4">
                    {current.items.map((it) => (
                      <article
                        key={it.item_id}
                        className="rounded-md p-3 flex flex-col items-center gap-3 transition-shadow"
                        style={{
                          background: "transparent",
                          border: "1px solid var(--card-border)",
                        }}
                      >
                        <div className="w-full aspect-[4/3] rounded-md overflow-hidden flex items-center justify-center" style={{ background: "rgba(255,255,255,0.02)" }}>
                          <img
                            src={it?.icon}
                            alt={it.display_name}
                            className="object-contain w-full h-full"
                            onError={(e) => {
                              e.currentTarget.src =
                                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='100%25' height='100%25' fill='%230a192f'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='16'%3EImage not found%3C/text%3E%3C/svg%3E";
                            }}
                          />
                        </div>

                        <div className="w-full text-center">
                          <h4 className=" text-[10px] whitespace-nowrap  md:text-xs lg:text-sm font-semibold text-white">
                            {it?.display_name}
                          </h4>
                          <div className="mt-2 flex items-center justify-center">
                            {/* <RarityBadge rarity={it.rarity} /> */}
                            <RarityBadge  label={it.rarity} fontSize={8} strokeWidth={1.7} res="sm" />
                            
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center" style={{ color: "#8892b0" }}>
                    <p className="mb-2">No plants in this category yet.</p>
                    <p className="text-sm">Add items to the category data to see them appear here.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* Rarity badge uses palette variables to keep consistent styling */
// function RarityBadge({ rarity }) {
//   const r = (rarity || "").toLowerCase();
//   let bg = "rgba(255,255,255,0.03)";
//   let color = "#ccd6f6";
//   if (r === "legendary") {
//     bg = "linear-gradient(90deg,#ffd166,#ffb84d)";
//     color = "#071217";
//   } else if (r === "rare") {
//     bg = "linear-gradient(90deg,#7c5cff,#6a9eff)";
//     color = "#06102a";
//   } else if (r === "common") {
//     bg = "rgba(255,255,255,0.03)";
//     color = "#8892b0";
//   }

//   return (
//     <span
//       className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
//       style={{
//         background: bg,
//         color,
//         boxShadow: r === "legendary" ? "0 2px 10px rgba(255,177,66,0.12)" : "none",
//       }}
//     >
//       {rarity || "Unknown"}
//     </span>
//   );
// }

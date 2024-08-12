import dotenv from "dotenv";
import { Match } from "effect";
import { makeConf } from "./common/makeConf";
import { SageGame } from "./core/SageGame";
import { SagePlayer } from "./core/SagePlayer";
import { startCargo } from "./prescripts/startCargo";
import { startCombo } from "./prescripts/startCombo";
import { startCraft } from "./prescripts/startCraft";
import { startMining } from "./prescripts/startMining";
import { startScan } from "./prescripts/startScan";

dotenv.config();

const program = async () => {
  const conf = makeConf();

  console.log(`Welcome to Ultron Copilot ${conf.version}!`);

  const createGame = async () => {
    // 1. Setup environment (SageGame.ts) [keypair required]
    try {
      const game = await SageGame.initFrom(conf);

      return game;
    } catch (err) {
      console.log(err);

      process.exit(1);
    }
  };

  const game = await createGame();

  // 2. Setup player (SagePlayer.ts)
  const playerProfiles = await game.getPlayerProfilesAsync();

  if (playerProfiles.type !== "Success") {
    console.log("Error getting player profiles.");
    return;
  }

  // TODO: Add specif option to choose player profile
  const playerProfile = playerProfiles.data[0];

  const player = await SagePlayer.initFrom({ game, playerProfile });

  // 3. Check if player has enough Quattrini
  const qttrBalance = await game.getQuattrinoBalance();

  if (qttrBalance.type !== "Success" || qttrBalance.data == 0) {
    console.log(qttrBalance.message);
    return;
  }

  console.log(qttrBalance.message);

  /* const userPoints = await player.getUserPointsAsync();
  if (userPoints.type !== "Success") return;
  console.log(userPoints.data) */

  const start = Match.value(conf.activity.name).pipe(
    Match.when("Mining", () => startMining(conf)),
    Match.when("Cargo", () => startCargo(conf)),
    Match.when("Combo", () => startCombo(conf)),
    Match.when("Craft", () => startCraft(conf)),
    Match.when("Scan", () => startScan(conf)),
    Match.exhaustive
  );

  const result = await start(player);

  if (result.type !== "Success") {
    console.log(result);
    return;
  }

  // 10. Play with galactic marketplace (GalacticMarketplace.ts)
  // ...

  /* const data = await sage.getPlanets()
  console.log(data) */

  /*  const data = await sage.getResourcesByPlanet(sage.getPlanets().find(item => item.data.planetType === PlanetType.AsteroidBelt)!)
   if (data.type !== "Success") throw new Error(data.type);
   console.log(sage.getResourceName(data.data[0])); */
};

program().catch((err) => {
  console.error(err);
  process.exit(1);
});

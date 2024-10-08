import { MovementType } from "../common/constants";
import { Conf } from "../common/makeConf";
import { SectorCoordinates } from "../common/types";
import { SectorRoute } from "../core/SageFleet";
import { SagePlayer } from "../core/SagePlayer";
import { scanV2 } from "../scripts/scanV2";
import { setFleetV2 } from "../utils/inputsV2/setFleet";
import { setMovementTypeV2 } from "../utils/inputsV2/setMovementType";
import { setScanCoordinates } from "../utils/inputsV2/setScanCoordinates";
import { setStarbaseV2 } from "../utils/inputsV2/setStarbase";

export const startScan =
  (conf: Pick<Conf, "activity">) => async (player: SagePlayer) => {
    // 2. set fleet
    const fleet = await setFleetV2(conf)(player, true);
    if (fleet.type !== "Success") return fleet;

    const fleetCurrentSector = fleet.data.getCurrentSector();
    if (!fleetCurrentSector)
      return { type: "FleetCurrentSectorError" as const };

    // 3. set scan sector
    const scanSectorCoords = fleetCurrentSector.hasStarbase
      ? await setScanCoordinates(fleetCurrentSector)
      : { type: "Success" as const, data: fleetCurrentSector.coordinates };

    const scanSector: SectorRoute = {
      coordinates: scanSectorCoords.data,
      key: player.getSageGame().getSectorKeyByCoords(scanSectorCoords.data),
      hasStarbase:
        player.getSageGame().getStarbaseByCoords(scanSectorCoords.data).type ===
        "Success",
    };

    const isSameSector = fleetCurrentSector.key.equals(scanSector.key);

    // 4a. set starbase to come back and movements
    let backStarbaseSector: SectorRoute;
    let movementGoBack: MovementType;

    backStarbaseSector = fleetCurrentSector;
    movementGoBack = (await setMovementTypeV2("(all)")).movement;

    // the fleet is not in a starbase sector
    if (isSameSector && !fleetCurrentSector.hasStarbase) {
      const starbase = await setStarbaseV2(conf)(
        fleet.data,
        true,
        "Choose the starbase to come back:"
      );
      if (starbase.type !== "Success") return starbase;

      backStarbaseSector = {
        coordinates: starbase.data.data.sector as SectorCoordinates,
        key: player
          .getSageGame()
          .getSectorKeyByCoords(starbase.data.data.sector as SectorCoordinates),
        hasStarbase: true,
      };
    }

    // 5. start scan loop
    for (let i = 0; i < conf.activity.cycles; i++) {
      const scan = await scanV2(
        fleet.data,
        scanSector,
        backStarbaseSector,
        movementGoBack
      );
      if (scan.type !== "Success") {
        return scan;
      }
    }

    return { type: "Success" } as const;
  };

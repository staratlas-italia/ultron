import { byteArrayToString } from "@staratlas/data-source";
import { Conf } from "../../common/makeConf";
import { SageFleet } from "../../core/SageFleet";
import { SagePlayer } from "../../core/SagePlayer";

export const setFleetV2 =
  ({ activity: { fleetName } }: Pick<Conf, "activity">) =>
  async (player: SagePlayer, showAllFleets: boolean = false) => {
    const fleets = await player.getAllFleetsAsync();

    if (fleets.type !== "Success") {
      return fleets;
    }

    const selectableFleets = fleets.data.filter((fleet) => {
      return !showAllFleets
        ? fleet.state.StarbaseLoadingBay || fleet.state.Idle
        : true;
    });

    if (selectableFleets.length === 0)
      return { type: "NoFleetsDockedOrUndocked" } as const;

    const maybeFleet = selectableFleets.find(
      (fleet) => fleetName === byteArrayToString(fleet.data.fleetLabel)
    );

    if (!maybeFleet) {
      return { type: "NoFleetsFound" } as const;
    }

    // Play with fleets (SageFleet.ts)
    const fleet = await SageFleet.init(maybeFleet, player);

    console.log(
      `Great. You have selected the fleet "${fleet.getName()}" located in (${fleet
        .getCurrentSector()
        ?.coordinates[0].toNumber()},${fleet
        .getCurrentSector()
        ?.coordinates[1].toNumber()})`
    );

    return { type: "Success", data: fleet } as const;
  };

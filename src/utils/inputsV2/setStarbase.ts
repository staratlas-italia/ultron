import { starbasesInfo } from "../../common/constants";
import { Conf } from "../../common/makeConf";
import { SageFleet } from "../../core/SageFleet";

export const setStarbaseV2 =
  ({ activity: { targetStarbaseSector } }: Pick<Conf, "activity">) =>
  async (
    fleet: SageFleet,
    excludeFleetCurrentStarbase: boolean = false,
    text: string
  ) => {
    const indexMap = new Map(
      starbasesInfo.map((item, index) => [item.name, index])
    );

    const starbases = fleet
      .getSageGame()
      .getStarbases()
      .map((starbase) => {
        const prettyName = fleet.getSageGame().getStarbasePrettyName(starbase);
        return {
          prettyName,
          data: starbase,
        };
      })
      .sort((a, b) => {
        const indexA = indexMap.get(a.prettyName) || indexMap.size;
        const indexB = indexMap.get(b.prettyName) || indexMap.size;

        return indexA - indexB;
      });

    const fleetCurrentSector = fleet.getCurrentSector();

    if (!fleetCurrentSector) {
      return { type: "FleetCurrentSectorError" as const };
    }

    const [targetSectorX, targetSectorY] = targetStarbaseSector;

    const maybeTargetStarbase = starbases.find((starbase) => {
      const [x, y] = starbase.data.data.sector;

      return (
        Number(x) === Number(targetSectorX) &&
        Number(y) === Number(targetSectorY)
      );
    });

    if (!maybeTargetStarbase) {
      return { type: "NoStarbaseFound" } as const;
    }

    return { type: "Success" as const, data: maybeTargetStarbase.data };
  };

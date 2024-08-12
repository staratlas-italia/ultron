import { byteArrayToString } from "@staratlas/data-source";
import { PlanetType, Sector } from "@staratlas/sage";
import { getOrNull } from "effect/Option";
import { Conf } from "../../common/makeConf";
import { SectorCoordinates } from "../../common/types";
import { SageFleet } from "../../core/SageFleet";
import { MinableResource } from "../../core/SageGame";

export const setResourceToMine =
  ({ activity: { miningResource } }: Pick<Conf, "activity">) =>
  async (fleet: SageFleet, sector: Sector) => {
    const planet = fleet
      .getSageGame()
      .getPlanetsByCoords(
        sector.data.coordinates as SectorCoordinates,
        PlanetType.AsteroidBelt
      );
    if (planet.type !== "Success") return planet;

    const asteroid = planet.data[0];

    const resources = fleet.getSageGame().getResourcesByPlanet(asteroid);
    if (resources.type !== "Success") return resources;

    const minableResources: MinableResource[] = [];

    for (const resource of resources.data) {
      const mineItem = fleet
        .getSageGame()
        .getMineItemByKey(resource.data.mineItem);
      if (mineItem.type !== "Success") {
        minableResources.length = 0;
        break;
      }

      minableResources.push({
        resource,
        mineItem: mineItem.data,
      });
    }

    if (minableResources.length === 0) {
      return { type: "NoMinableResources" as const };
    }

    const maybeMiningResource = minableResources.find(
      (minableResource) =>
        byteArrayToString(minableResource.mineItem.data.name) ===
        getOrNull(miningResource)
    );

    if (!maybeMiningResource) {
      return { type: "NoMiningResource" as const };
    }

    return { type: "Success" as const, data: maybeMiningResource };
  };

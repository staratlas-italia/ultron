import { SageFleet } from "../core/SageFleet";
import { ResourceName } from "../core/SageGame";
import { wait } from "../utils/actions/wait";

export const startMining = async (
  fleet: SageFleet,
  resourceName: ResourceName,
  time: number
) => {
  // action starts
  console.log(`\nStart mining ${resourceName}...`);

  // data
  // ...

  // instruction
  const ix = await fleet.ixStartMining(resourceName);

  // issues and errors handling
  switch (ix.type) {
    // issues that lead to the next action of the main script or the end of the script
    case "FleetIsMining":
      return { type: "FleetIsMining" as const };

    case "FleetIsDocked":
      return { type: "FleetIsDocked" as const };

    // blocking errors or failures that require retrying the entire action
    default:
      if (ix.type !== "Success") throw new Error(ix.type); // retry entire action
  }

  // build and send transactions
  const sdt = await fleet
    .getSageGame()
    .buildAndSendDynamicTransactions(ix.ixs, resourceName !== "Hydrogen");
  if (sdt.type !== "Success") throw new Error(sdt.type); // retry entire action

  // other
  console.log(`Mining started! Waiting for ${time} seconds...`);
  await wait(time);

  // action ends
  return { type: "Success" as const };
};

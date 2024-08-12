import { Connection, Keypair } from "@solana/web3.js";
import base58 from "bs58";
import { Config, Effect, Number } from "effect";
import { resourceNames } from "../core/SageGame";
import { PriorityFee, activites, priorities } from "./constants";

const connectionConfig = Config.string("RPC_ENDPOINT").pipe(
  Config.validate({
    message: "Should be a valid url",
    validation: (value) => {
      try {
        new URL(value);

        return true;
      } catch {
        return false;
      }
    },
  }),
  Config.map((value) => new Connection(value))
);

const keypairConfig = Config.string("SECRET_KEY").pipe(
  Config.map((secretKey) => Keypair.fromSecretKey(base58.decode(secretKey)))
);

const priorityFeeConfig = Config.literal(...priorities)("PRIORITY_FEE").pipe(
  Config.orElse(() => Config.integer("PRIORITY_FEE")),
  Config.map(
    (value): PriorityFee =>
      (Number.isNumber(value)
        ? { type: "custom" as const, value }
        : { type: value }) satisfies PriorityFee
  )
);

export const makeConf = () =>
  Effect.runSync(
    Config.all([
      Config.string("APP_VERSION").pipe(
        Config.orElse(() => Config.string("npm_package_version"))
      ),
      connectionConfig,
      keypairConfig,
      Config.literal(...activites)("ACTIVITY_NAME"),
      Config.option(Config.literal(...resourceNames)("MINING_RESOURCE")),
      Config.string("FLEET_NAME"),
      priorityFeeConfig,
      Config.integer("RUNNING_CYCLES"),
      Config.integer("TARGET_STARBASE_SECTOR_X"),
      Config.integer("TARGET_STARBASE_SECTOR_Y"),
    ]).pipe(
      Config.map(
        ([
          version,
          connection,
          keypair,
          activityName,
          miningResource,
          fleetName,
          priorityFee,
          runningCycles,
          targetStarbaseSectorX,
          targetStarbaseSectorY,
        ]) => ({
          version,
          connection,
          keypair,
          priorityFee,
          activity: {
            name: activityName,
            fleetName,
            miningResource,
            cycles: runningCycles,
            targetStarbaseSector: [
              targetStarbaseSectorX,
              targetStarbaseSectorY,
            ] as const,
          },
        })
      )
    )
  );

export type Conf = ReturnType<typeof makeConf>;

import { BN } from "@staratlas/anchor";
import { ResourceName } from "../core/SageGame";

export type LabsAction<R, A extends any[]> = (...args: A) => Promise<R>;

export type InputResourcesForCargo = {
  resource: ResourceName;
  amount: number;
};

export type SectorCoordinates = [BN, BN];

export type EncryptedData = {
  iv: string;
  salt: string;
  content: string;
  tag: string;
};

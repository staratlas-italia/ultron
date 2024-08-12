export enum NotificationMessage {
  CARGO_SUCCESS = "TRANSPORT cycle completed SUCCESSFULLY",
  MINING_SUCCESS = "MINING cycle completed SUCCESSFULLY",
  MINING_CARGO_SUCCESS = "MINING and TRANSPORT cycle completed SUCCESSFULLY",
  CARGO_ERROR = "An ERROR occurred during TRANSPORT",
  MINING_ERROR = "An ERROR occurred during MINING",
  MINING_CARGO_ERROR = "An ERROR occurred during the MINING and TRANSPORT cycle",
  SCAN_ERROR = "An ERROR occurred during SCANNING",
  FAIL_WARNING = "An action has FAILED and is REPEATING. If the problem persists after 4-5 retry, set the fleet in the required state or contact the support",
  SCAN_SUCCESS = "SDUs have been successfully deposited in Starbase",
  CRAFT_SUCCESS = "CRAFTING cycle completed SUCCESSFULLY",
  CRAFT_ERROR = "An ERROR occurred during CRAFTING",
}

import { NotificationMessage } from "../../common/notifications";

export const sendNotification = async (
  notification: NotificationMessage,
  fleetName?: string
) => {
  console.log(fleetName ? `\n${fleetName}: ${notification}` : notification);
};

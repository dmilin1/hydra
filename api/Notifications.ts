import { HYDRA_SERVER_URL } from "../constants/HydraServer";

export async function registerNotifications(
  customerId: string,
  pushToken: string,
  accounts: { username: string; session: string }[],
) {
  try {
    const response = await fetch(
      `${HYDRA_SERVER_URL}/api/notifications/register`,
      {
        method: "POST",
        body: JSON.stringify({ customerId, pushToken, accounts }),
      },
    );
    return response.text();
  } catch (error) {
    console.error("error registering notifications", error);
  }
}

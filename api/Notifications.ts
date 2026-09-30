import { hydraFetch } from "../constants/HydraServer";

export async function registerNotifications(
  customerId: string,
  pushToken: string,
  accounts: { username: string; session: string }[],
) {
  try {
    const response = await hydraFetch("/api/notifications/register", {
      method: "POST",
      body: JSON.stringify({ customerId, pushToken, accounts }),
    });
    return response.text();
  } catch (error) {
    console.error("error registering notifications", error);
  }
}

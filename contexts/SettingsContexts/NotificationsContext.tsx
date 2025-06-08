import * as Notifications from "expo-notifications";
import { createContext, useContext, useEffect } from "react";
import { useMMKVBoolean } from "react-native-mmkv";

import { registerNotifications } from "../../api/Notifications";
import RedditCookies from "../../utils/RedditCookies";
import { AccountContext } from "../AccountContext";
import { SubscriptionsContext } from "../SubscriptionsContext";

const initialValues = {
  notificationsEnabled: true,
};

const initialNotificationsContext = {
  ...initialValues,
  toggleNotifications: (_newValue?: boolean) => {},
};

export const NotificationsContext = createContext(initialNotificationsContext);

export function NotificationsProvider({ children }: React.PropsWithChildren) {
  const [storedNotificationsEnabled, setNotificationsEnabled] = useMMKVBoolean(
    "notificationsEnabled",
  );
  const notificationsEnabled =
    storedNotificationsEnabled ?? initialValues.notificationsEnabled;

  const { accounts } = useContext(AccountContext);
  const { isPro, customerId } = useContext(SubscriptionsContext);

  const registerForPushNotifications = async () => {
    if (!customerId) return;

    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        return;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;

      const accountsWithSession = (
        await Promise.all(
          accounts.map(async (acc) => ({
            username: acc.username,
            session: await RedditCookies.getSessionCookies(acc),
          })),
        )
      ).filter((acc) => acc.session !== null) as {
        username: string;
        session: string;
      }[];

      await registerNotifications(customerId, token, accountsWithSession);
    } catch (error) {
      console.error("Error registering for push notifications:", error);
    }
  };

  const toggleNotifications = async (newValue = !notificationsEnabled) => {
    if (newValue && !isPro) {
      alert("Push notifications are only available for Hydra Pro users");
      return;
    }

    setNotificationsEnabled(newValue);
    if (newValue) {
      await registerForPushNotifications();
    }
  };

  useEffect(() => {
    if (isPro && notificationsEnabled) {
      registerForPushNotifications();
    }
  }, [isPro, notificationsEnabled, accounts]);

  return (
    <NotificationsContext.Provider
      value={{
        notificationsEnabled,
        toggleNotifications,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

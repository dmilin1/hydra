import { useContext, useEffect } from "react";
import { Alert } from "react-native";

import { AccountContext } from "../../contexts/AccountContext";
import { ToastContext } from "../../contexts/ToastContext";

/**
 * Explains a locked or suspended account after each login, since Reddit only
 * says "Permission denied" when the account tries to do something. A lock the
 * user can lift gets an alert they have to read; a suspension they can only
 * wait out gets a toast, so it doesn't nag them on every launch.
 */
export default function AccountRestrictionNotice() {
  const { currentUser } = useContext(AccountContext);
  const { showToast } = useContext(ToastContext);

  // Every login sets a new currentUser, so this shows once per login.
  useEffect(() => {
    const restriction = currentUser?.restriction;
    if (!restriction) return;
    if (restriction.isActionable) {
      Alert.alert(restriction.title, restriction.body);
    } else {
      showToast({
        title: restriction.title,
        body: restriction.body,
        delay: 5_000,
      });
    }
  }, [currentUser]);

  return null;
}

import React, {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import UpdateInfo, {
  LAST_SEEN_UPDATE_KEY,
  updateInfo,
} from "../components/Modals/StartupModals/UpdateInfo";
import { getStat, Stat } from "../db/functions/Stats";
import KeyStore from "../utils/KeyStore";
import PromptForReview, {
  STORE_REVIEW_REQUESTED_KEY,
} from "../components/Modals/StartupModals/PromptForReview";
import GetHydraPro, {
  HYDRA_PRO_LAST_OFFERED_KEY,
} from "../components/Modals/StartupModals/GetHydraPro";

export type ModalId = "updateInfo" | "promptForReview" | "getHydraPro";

const modals: { id: ModalId; wantsToShow: boolean }[] = [
  {
    id: "updateInfo",
    wantsToShow:
      KeyStore.getString(LAST_SEEN_UPDATE_KEY) !== updateInfo.updateKey,
  },
  {
    id: "promptForReview",
    wantsToShow:
      (getStat(Stat.APP_LAUNCHES) ?? 0) > 30 &&
      !KeyStore.getBoolean(STORE_REVIEW_REQUESTED_KEY),
  },
  {
    id: "getHydraPro",
    wantsToShow:
      (getStat(Stat.APP_LAUNCHES) ?? 0) > 50 &&
      (KeyStore.getNumber(HYDRA_PRO_LAST_OFFERED_KEY) ?? 0) <
        Date.now() - 1000 * 60 * 60 * 24 * 90,
  },
];

const initialState = {
  startupModal: null as ModalId | null,
  setStartupModal: (() => {}) as Dispatch<SetStateAction<ModalId | null>>,
};

export const StartupModalContext = createContext(initialState);

export function StartupModalProvider({ children }: PropsWithChildren) {
  const [startupModal, setStartupModal] = useState(initialState.startupModal);

  const showTopPriorityModal = () => {
    const modal = modals.find((modal) => modal.wantsToShow);
    if (modal) {
      setStartupModal(modal.id);
    }
  };

  useEffect(() => {
    showTopPriorityModal();
  }, []);

  return (
    <StartupModalContext.Provider value={{ startupModal, setStartupModal }}>
      {startupModal === "updateInfo" && (
        <UpdateInfo onExit={() => setStartupModal(null)} />
      )}
      {startupModal === "promptForReview" && (
        <PromptForReview onExit={() => setStartupModal(null)} />
      )}
      {startupModal === "getHydraPro" && (
        <GetHydraPro onExit={() => setStartupModal(null)} />
      )}
      {children}
    </StartupModalContext.Provider>
  );
}

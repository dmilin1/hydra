import { createContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import Purchases, {
  CustomerInfo,
  CustomerInfoUpdateListener,
  PurchasesPackage,
} from "react-native-purchases";

import { registerCustomer } from "../api/Customer";

Purchases.configure({
  apiKey: "appl_okkBpjboHClPttmFHfsSWRaGSFd",
});

const HYDRA_299_1M_PRODUCT_ID = "hydra_299_1m";
const HYDRA_PRO_ENTITLEMENT = "Hydra Pro";

interface SubscriptionContextType {
  purchasesInitialized: boolean;
  customerInfo: CustomerInfo | null;
  customerId: string | null;
  isPro: boolean;
  buyPro: () => Promise<void>;
  getCustomerInfo: (refresh?: boolean) => Promise<void>;
  proOffering: PurchasesPackage | null;
  isLoadingOffering: boolean;
  inGracePeriod: boolean;
  gracePeriodEndsAt: number | null;
}

const initialSubscriptionContext: SubscriptionContextType = {
  purchasesInitialized: false,
  customerInfo: null,
  customerId: null,
  isPro: false,
  buyPro: async () => {},
  proOffering: null,
  getCustomerInfo: async () => {},
  isLoadingOffering: true,
  inGracePeriod: false,
  gracePeriodEndsAt: null,
};

export const SubscriptionsContext = createContext(initialSubscriptionContext);

export function SubscriptionsProvider({ children }: React.PropsWithChildren) {
  const [purchasesInitialized, setPurchasesInitialized] = useState(
    initialSubscriptionContext.purchasesInitialized,
  );
  const [customerInfo, setCustomerInfo] = useState(
    initialSubscriptionContext.customerInfo,
  );
  const [proOffering, setProOffering] = useState<PurchasesPackage | null>(null);
  const [isLoadingOffering, setIsLoadingOffering] = useState(true);

  const customerId = customerInfo?.originalAppUserId ?? null;

  const isPro =
    customerInfo?.entitlements.active[HYDRA_PRO_ENTITLEMENT]?.isActive ?? false;

  const inGracePeriod =
    isPro &&
    !customerInfo?.entitlements.active[HYDRA_PRO_ENTITLEMENT]?.willRenew;

  const gracePeriodEndsAt = inGracePeriod
    ? (customerInfo?.entitlements.active[HYDRA_PRO_ENTITLEMENT]
        ?.expirationDateMillis ?? null)
    : null;

  const loadOffering = async () => {
    try {
      const offerings = await Purchases.getOfferings();
      const hydraProOffering = offerings.current?.availablePackages.find(
        (p) => p.product.identifier === HYDRA_299_1M_PRODUCT_ID,
      );
      setProOffering(hydraProOffering ?? null);
    } catch (error) {
      console.error("Error loading offering:", error);
    } finally {
      setIsLoadingOffering(false);
    }
  };

  const buyPro = async () => {
    try {
      if (!proOffering) {
        throw new Error("Hydra Pro offering not found");
      }
      const result = await Purchases.purchasePackage(proOffering);
      setCustomerInfo(result.customerInfo);
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        "message" in error
      ) {
        if (
          error.code === Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR
        ) {
          return;
        }
        Alert.alert(error.message as string);
      } else {
        Alert.alert("Something went wrong");
      }
      await getCustomerInfo(true);
    }
  };

  const getCustomerInfo = async (refresh = false) => {
    setPurchasesInitialized(false);
    if (refresh) {
      Purchases.invalidateCustomerInfoCache();
    }
    const customerInfo = await Purchases.getCustomerInfo();
    setCustomerInfo(customerInfo);
    setPurchasesInitialized(true);
  };

  useEffect(() => {
    getCustomerInfo();
    loadOffering();
    const handleCustomerInfoUpdate: CustomerInfoUpdateListener = async (
      customerInfo,
    ) => {
      setCustomerInfo(customerInfo);
    };
    Purchases.addCustomerInfoUpdateListener(handleCustomerInfoUpdate);
    return () => {
      Purchases.removeCustomerInfoUpdateListener(handleCustomerInfoUpdate);
    };
  }, []);

  useEffect(() => {
    if (isPro && customerInfo) {
      registerCustomer({
        customerId: customerInfo.originalAppUserId,
      });
    }
  }, [isPro]);

  return (
    <SubscriptionsContext.Provider
      value={{
        purchasesInitialized,
        customerInfo,
        customerId,
        isPro,
        buyPro,
        proOffering,
        getCustomerInfo,
        isLoadingOffering,
        inGracePeriod,
        gracePeriodEndsAt,
      }}
    >
      {children}
    </SubscriptionsContext.Provider>
  );
}

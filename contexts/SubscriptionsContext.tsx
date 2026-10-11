import { createContext, useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
import Purchases, {
  CustomerInfo,
  CustomerInfoUpdateListener,
  PRODUCT_CATEGORY,
  PurchasesPackage,
  PurchasesStoreProduct,
} from "react-native-purchases";

import { registerCustomer } from "../api/Customer";
import { USING_CUSTOM_HYDRA_SERVER } from "../constants/HydraServer";

Purchases.setLogLevel(Purchases.LOG_LEVEL.ERROR);
Purchases.configure({
  apiKey:
    Platform.OS === "android"
      ? "goog_owTGUhWdmCepBrlSXGNXwHJfyPC"
      : "appl_okkBpjboHClPttmFHfsSWRaGSFd",
});

const HYDRA_299_1M_PRODUCT_ID_IOS = "hydra_299_1m";
const HYDRA_299_1M_PRODUCT_ID_ANDROID = "hydra_pro:hydra-299-1m";
const HYDRA_299_1M_PRODUCT_ID =
  Platform.OS === "android"
    ? HYDRA_299_1M_PRODUCT_ID_ANDROID
    : HYDRA_299_1M_PRODUCT_ID_IOS;
const HYDRA_PRO_ENTITLEMENT = "Hydra Pro";

export const TIP_PRODUCT_IDS_IOS = [
  "com.dmilin.hydra.tip.small",
  "com.dmilin.hydra.tip.medium",
  "com.dmilin.hydra.tip.large",
  "com.dmilin.hydra.tip.huge",
] as const;

export type TipProductId = (typeof TIP_PRODUCT_IDS_IOS)[number];

interface SubscriptionContextType {
  purchasesInitialized: boolean;
  customerInfo: CustomerInfo | null;
  customerId: string | null;
  isPro: boolean;
  buyPro: () => Promise<void>;
  buyTip: (product: PurchasesStoreProduct) => Promise<boolean>;
  getCustomerInfo: (refresh?: boolean) => Promise<void>;
  restorePurchases: () => Promise<void>;
  proOffering: PurchasesPackage | null;
  tipProducts: PurchasesStoreProduct[] | null;
  isLoadingProductsAndOfferings: boolean;
  inGracePeriod: boolean;
  gracePeriodEndsAt: number | null;
}

const initialSubscriptionContext: SubscriptionContextType = {
  purchasesInitialized: false,
  customerInfo: null,
  customerId: null,
  isPro: false,
  buyPro: async () => {},
  buyTip: async () => false,
  getCustomerInfo: async () => {},
  restorePurchases: async () => {},
  proOffering: null,
  tipProducts: null,
  isLoadingProductsAndOfferings: true,
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
  const [tipProducts, setTipProducts] = useState<
    PurchasesStoreProduct[] | null
  >(null);
  const [isLoadingProductsAndOfferings, setIsLoadingProductsAndOfferings] =
    useState(true);

  const customerId = customerInfo?.originalAppUserId ?? null;

  const isPro =
    USING_CUSTOM_HYDRA_SERVER ||
    (customerInfo?.entitlements.active[HYDRA_PRO_ENTITLEMENT]?.isActive ??
      false);

  const inGracePeriod =
    isPro &&
    !customerInfo?.entitlements.active[HYDRA_PRO_ENTITLEMENT]?.willRenew;

  const gracePeriodEndsAt = inGracePeriod
    ? (customerInfo?.entitlements.active[HYDRA_PRO_ENTITLEMENT]
        ?.expirationDateMillis ?? null)
    : null;

  const loadHydraProOffering = async () => {
    const offerings = await Purchases.getOfferings();
    const hydraProOffering = offerings.current?.availablePackages.find(
      (p) => p.product.identifier === HYDRA_299_1M_PRODUCT_ID,
    );
    return hydraProOffering ?? null;
  };

  const loadTipProducts = async () => {
    const products = await Purchases.getProducts(
      TIP_PRODUCT_IDS_IOS as unknown as string[],
      PRODUCT_CATEGORY.NON_SUBSCRIPTION,
    );
    const productsInOrder = TIP_PRODUCT_IDS_IOS.map((id) => {
      const item = products.find((p) => p.identifier === id);
      if (!item) {
        throw new Error(`Product ${id} not found`);
      }
      return item;
    });
    return productsInOrder;
  };

  const loadProductsAndOfferings = async () => {
    try {
      const [hydraProOffering, tipProducts] = await Promise.all([
        loadHydraProOffering(),
        loadTipProducts(),
      ]);
      setProOffering(hydraProOffering);
      setTipProducts(tipProducts);
    } catch (error) {
      console.error("Error loading offering:", error);
    } finally {
      setIsLoadingProductsAndOfferings(false);
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

  const buyTip = async (product: PurchasesStoreProduct) => {
    try {
      await Purchases.purchaseStoreProduct(product);
      return true;
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        "message" in error
      ) {
        if (
          error.code !== Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR
        ) {
          Alert.alert(error.message as string);
        }
      } else {
        Alert.alert("Something went wrong");
      }
      return false;
    }
  };

  const restorePurchases = async () => {
    setPurchasesInitialized(false);
    const customerInfo = await Purchases.restorePurchases();
    setCustomerInfo(customerInfo);
    setPurchasesInitialized(true);
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
    loadProductsAndOfferings();
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
        buyTip,
        proOffering,
        tipProducts,
        getCustomerInfo,
        isLoadingProductsAndOfferings,
        inGracePeriod,
        gracePeriodEndsAt,
        restorePurchases,
      }}
    >
      {children}
    </SubscriptionsContext.Provider>
  );
}

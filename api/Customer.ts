import { HYDRA_SERVER_URL } from "../constants/HydraServer";

type Customer = {
  customerId: string;
  pushToken?: string;
};

export async function registerCustomer(customer: Customer) {
  try {
    const response = await fetch(`${HYDRA_SERVER_URL}/api/customers/register`, {
      method: "POST",
      body: JSON.stringify(customer),
    });
    return response.json();
  } catch (error) {
    console.error("error registering customer", error);
  }
}

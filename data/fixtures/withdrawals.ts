import type { WithdrawalRequest } from "@/lib/types";

export const withdrawalFixture: WithdrawalRequest[] = [
  {
    id: 301,
    reference: "WD-2404-01",
    amount: 250,
    currency: "GBP",
    payoutMethod: "bank",
    payoutDetails: {
      accountName: "GreenHub Testing",
      accountNumber: "****4451",
      sortCode: "11-22-33"
    },
    status: "pending",
    fee: 5,
    createdAt: new Date().toISOString()
  },
  {
    id: 302,
    reference: "WD-2403-18",
    amount: 400,
    currency: "GBP",
    payoutMethod: "crypto",
    payoutDetails: {
      network: "TRC20",
      address: "TC9R...9ab"
    },
    status: "approved",
    fee: 8,
    createdAt: new Date(Date.now() - 3600 * 1000 * 8).toISOString()
  },
  {
    id: 303,
    reference: "WD-2402-11",
    amount: 150,
    currency: "GBP",
    payoutMethod: "wallet",
    payoutDetails: {
      handle: "@lockerbot"
    },
    status: "paid",
    fee: 3,
    createdAt: new Date(Date.now() - 3600 * 1000 * 24 * 2).toISOString()
  },
  {
    id: 304,
    reference: "WD-2401-07",
    amount: 500,
    currency: "GBP",
    payoutMethod: "bank",
    payoutDetails: {
      accountName: "Alpha Ops",
      accountNumber: "****0021",
      sortCode: "44-55-66"
    },
    status: "rejected",
    notes: "Compliance requested updated proof of address",
    createdAt: new Date(Date.now() - 3600 * 1000 * 72).toISOString()
  }
];

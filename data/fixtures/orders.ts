import type { OrderRecord } from "@/lib/types";

export const ordersFixture: OrderRecord[] = [
  {
    id: 101,
    reference: "GH-2401",
    status: "delivered",
    totalAmount: 185,
    currency: "GBP",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    lockerPostcode: "BT7 1NN",
    paymentOption: "wallet",
    items: [
      {
        productId: 1,
        title: "Geist Flower — Citrus Rush",
        quantity: 2,
        weight: "3.5g",
        unitPrice: 55,
        lineTotal: 110
      },
      {
        productId: 2,
        title: "Infused Minis — Ember Five Pack",
        quantity: 1,
        weight: "5 pack",
        unitPrice: 75,
        lineTotal: 75
      }
    ]
  },
  {
    id: 102,
    reference: "GH-2398",
    status: "processing",
    totalAmount: 95,
    currency: "GBP",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    lockerPostcode: "BT1 3AB",
    paymentOption: "nowpayments",
    items: [
      {
        productId: 3,
        title: "Locker Vape Kit — Midnight",
        quantity: 1,
        weight: "1g",
        unitPrice: 95,
        lineTotal: 95
      }
    ]
  },
  {
    id: 103,
    reference: "GH-2392",
    status: "canceled",
    totalAmount: 60,
    currency: "GBP",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    lockerPostcode: "BT9 5DL",
    paymentOption: "wallet",
    items: [
      {
        productId: 4,
        title: "Locker Cart — Honeycomb",
        quantity: 1,
        weight: "1g",
        unitPrice: 60,
        lineTotal: 60
      }
    ]
  }
];

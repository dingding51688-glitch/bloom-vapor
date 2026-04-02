export type WalletBalanceResponse = {
  success: boolean;
  balance: number;
  lifetimeTopUp: number;
  bonusAwarded: number;
};

export type WalletTransaction = {
  id: number;
  documentId?: string;
  type: string;
  amount: number;
  currency: string;
  reference: string;
  description?: string;
  reviewStatus?: string;
  createdAt?: string;
  balanceBefore?: number;
  balanceAfter?: number;
};

export type WalletTransactionsResponse = {
  success: boolean;
  data: WalletTransaction[];
};

export type WithdrawalRequest = {
  id: number;
  reference: string;
  amount: number;
  currency: string;
  payoutMethod: string;
  payoutDetails?: Record<string, unknown> | null;
  status: string;
  fee?: number | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type WithdrawalListResponse = {
  data: WithdrawalRequest[];
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
};

export type NotificationRecord = {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt?: string;
  metadata?: Record<string, unknown> | null;
};

export type NotificationsResponse = {
  success: boolean;
  data: NotificationRecord[];
};

export type UnreadCountResponse = {
  success: boolean;
  unreadCount: number;
};

export type OrderItem = {
  productId: number;
  title: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  weight?: string | null;
};

export type OrderRecord = {
  id: number;
  documentId?: string;
  reference: string;
  status: string;
  totalAmount: number;
  currency: string;
  createdAt?: string;
  updatedAt?: string;
  lockerPostcode?: string | null;
  lockerEta?: string | null;
  paymentOption?: string | null;
  walletDebit?: number | null;
  items?: OrderItem[];
};

export type OrdersResponse = {
  success: boolean;
  data: OrderRecord[];
};

export type CheckoutResponse = {
  success: boolean;
  order: {
    id: number;
    reference: string;
    status: string;
    totalAmount: number;
  };
};

export type ProductCardData = {
  id: string;
  title: string;
  category?: string;
  description?: string;
  price?: string;
  badge?: string;
  imageUrl?: string;
};

export type WeightOption = {
  id: number;
  label: string;
  price: number;
  unitPrice: string;
  featured?: boolean;
};

export type ProductImage = {
  url: string;
  alternativeText?: string | null;
};

export type ProductRecord = {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  description: string;
  heroBadge?: string | null;
  priceFrom: number;
  strain: string;
  thc?: string | null;
  potency?: string | null;
  rating?: number | null;
  reviews?: number | null;
  category?: string | null;
  coverImage?: ProductImage | null;
  weightOptions?: WeightOption[];
};

export type ProductsResponse = {
  data: ProductRecord[];
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
};

export type StrapiMediaAttributes = {
  url: string;
  alternativeText?: string | null;
  name?: string;
  formats?: Record<string, { url: string }>;
};

export type StrapiMedia = {
  id: number;
  attributes: StrapiMediaAttributes;
};

export type StrapiSingleResponse<T> = {
  data: {
    id: number;
    attributes: T;
  } | null;
};

export type StrapiListResponse<T> = {
  data: Array<{
    id: number;
    attributes: T;
  }>;
};

export type AdminProductRecord = {
  id: number;
  title: string;
  slug: string;
  description?: string;
  heroBadge?: string;
  priceFrom: number;
  strain?: string;
  thc?: string;
  potency?: string;
  origin?: string;
  originFlag?: string;
  weightOptions?: Array<{
    id?: number;
    label: string;
    price: number;
    unitPrice?: string;
    featured?: boolean;
  }>;
  featuredImage?: {
    id: number;
    url: string;
    name?: string;
  } | null;
  gallery?: Array<{
    id: number;
    url: string;
    name?: string;
  }>;
  collection?: {
    id: number;
    title?: string;
  } | null;
};

export type CollectionRecord = {
  title: string;
  slug?: string;
};

export type TopupTier = {
  id: number;
  title: string;
  description?: string | null;
  minAmountUsdt: number;
  maxAmountUsdt?: number | null;
  bonusPercent?: number | null;
  isActive?: boolean;
};

export type TopupIntentMeta = {
  id: number;
  orderCode: string;
  invoiceUrl?: string;
  amount: number;
  chain: string;
};

export type TopupIntentResponse = {
  success: boolean;
  topup: TopupIntentMeta;
};

export type TopupRecord = {
  id?: number;
  orderCode: string;
  status: string;
  amountFiat: number;
  fiatCurrency: string;
  amountCrypto?: number | null;
  cryptoCurrency?: string | null;
  network?: string | null;
  payAddress?: string | null;
  invoiceUrl?: string | null;
  expiresAt?: string | null;
  bonusUsdt?: number | null;
  createdAt?: string;
  updatedAt?: string;
};

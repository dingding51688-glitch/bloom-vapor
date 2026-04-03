export type TransferIdSource = {
  walletTransferId?: string | null;
  documentId?: string | null;
  customer?: {
    documentId?: string | null;
  } | null;
  id?: number | null;
};

export const deriveTransferId = (profile?: TransferIdSource | null) => {
  return (
    profile?.walletTransferId ||
    profile?.documentId ||
    profile?.customer?.documentId ||
    (profile?.id ? `UID-${profile.id}` : null)
  );
};

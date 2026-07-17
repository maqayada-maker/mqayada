export type RequestRefInput = {
  id: number;
  financingPurpose?: string | null;
  financingType?: string | null;
  sector?: string | null;
};

const PRODUCT_PREFIX: Record<string, string> = {
  debt_transfer: "Buyout",
  personal: "PF",
  real_estate: "RE",
  car: "Car",
};

const SECTOR_SUFFIX: Record<string, string> = {
  government: "Gov",
  semi_government: "Sgov",
  private: "Priv",
  retired: "Ret",
};

export function formatRequestRef(req: RequestRefInput): string {
  const purposeKey = req.financingPurpose ?? "";
  const typeKey = req.financingType ?? "";
  const product =
    PRODUCT_PREFIX[purposeKey] ??
    PRODUCT_PREFIX[typeKey] ??
    "REQ";
  const sectorKey = req.sector ?? "";
  const sector = SECTOR_SUFFIX[sectorKey] ?? "";
  const num = String(req.id).padStart(4, "0");
  return sector ? `${product}-${sector}-${num}` : `${product}-${num}`;
}

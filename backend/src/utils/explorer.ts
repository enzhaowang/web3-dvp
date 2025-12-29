import { config } from "../config";

export function txLink(hash: string) {
  if (!hash) return "";
  return `${config.explorerTxBase}${hash}`;
}

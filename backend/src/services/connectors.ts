import { createConnectors } from "@backend/services/connector-contract.mjs";
import { getConnectorBinding } from "@backend/services/connector-context";

/** Keep invocation context on this request; never cache it across visitors. */
export function connectorsForRequest() {
  return createConnectors(getConnectorBinding());
}
export type {
  ConnectorContext,
  ConnectorResult,
  ConnectorFailureStatus,
  Json,
} from "@backend/services/connector-contract.mjs";

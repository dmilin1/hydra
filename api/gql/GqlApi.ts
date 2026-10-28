import * as Sentry from "@sentry/react-native";

import { USER_AGENT } from "../UserAgent";
import safeFetch from "../../utils/safeFetch";
import {
  getWebToken,
  RecentTokenRejectedError,
  refreshWebToken,
} from "./WebToken";

const GQL_URL = "https://cf.gql-fed.reddit.com/";

/**
 * A persisted query from Reddit's own app. Reddit's GraphQL API only runs
 * queries it already knows, identified by the sha256 hash of the query
 * document, so requests send the name and hash instead of the query itself.
 */
export type GqlOperation = {
  name: string;
  hash: string;
};

export function defineOperation(name: string, hash: string): GqlOperation {
  return { name, hash };
}

type GqlErrorItem = {
  message: string;
  path?: (string | number)[];
  extensions?: { code?: string; [key: string]: any };
};

export class GqlError extends Error {
  operation: string;
  status: number;
  errors: GqlErrorItem[];

  constructor(operation: string, status: number, errors: GqlErrorItem[]) {
    const detail = errors[0]?.extensions?.code ?? errors[0]?.message;
    super(`${operation} failed (HTTP ${status}${detail ? `, ${detail}` : ""})`);
    this.name = "GqlError";
    this.operation = operation;
    this.status = status;
    this.errors = errors;
  }
}

type GqlResponse = {
  data?: any;
  errors?: GqlErrorItem[];
};

async function send(
  operation: GqlOperation,
  variables: Record<string, any>,
  token: string,
) {
  return await safeFetch(GQL_URL, {
    method: "POST",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": USER_AGENT,
    },
    body: JSON.stringify({
      operationName: operation.name,
      variables,
      extensions: {
        persistedQuery: { version: 1, sha256Hash: operation.hash },
      },
    }),
  });
}

/**
 * Runs a GraphQL operation as the logged in user and returns its `data`.
 *
 * Throws NotLoggedInError when no user is logged in, and GqlError when Reddit
 * returns no data. Responses with both data and errors (e.g. one field of a
 * post failed to resolve) return the partial data.
 */
export async function gql(
  operation: GqlOperation,
  variables: Record<string, any> = {},
): Promise<any> {
  const token = await getWebToken();
  let res = await send(operation, variables, token);
  if (res.status === 401 || res.status === 403) {
    // Reddit's edge rejects invalid or revoked tokens with a 403 HTML page
    // (401 means no token at all). Retry once with a new token, unless this
    // one was only just issued: then the rejection is about something else,
    // and the error below is thrown instead.
    const newToken = await refreshWebToken(token).catch((e) => {
      if (e instanceof RecentTokenRejectedError) return null;
      throw e;
    });
    if (newToken) res = await send(operation, variables, newToken);
  }

  let json: GqlResponse;
  try {
    // Not res.json(): its parse-failure breadcrumb includes the request
    // headers, and so the token.
    json = JSON.parse(await res.text());
  } catch (_e) {
    throw new GqlError(operation.name, res.status, [
      { message: "Response was not JSON" },
    ]);
  }

  if (!res.ok || json.data == null) {
    throw new GqlError(operation.name, res.status, json.errors ?? []);
  }
  if (json.errors?.length) {
    Sentry.addBreadcrumb({
      message: `${operation.name} returned partial data`,
      data: { errors: json.errors },
    });
  }
  return json.data;
}

/**
 * Throws Reddit's reason (e.g. rate limited, locked or archived) when a
 * mutation's result isn't ok.
 */
export function assertOk(result: any, fallback: string) {
  if (result?.ok) return;
  throw new Error(
    result?.fieldErrors?.[0]?.message ??
      result?.errors?.[0]?.message ??
      fallback,
  );
}

import { describe, it, expect } from "vitest";
import {
  hasRefreshTokenCookie,
  getCookie,
  setCookie,
  setAccessTokenCookie,
  getAccessTokenFromCookie,
  clearAccessTokenCookie,
  setRefreshTokenCookie,
  getRefreshTokenFromCookie,
  clearRefreshTokenCookie,
  getOrCreateFingerprint,
} from "@/services/authHelpers";

describe("authHelpers", () => {
  it("getCookie returns cookie value by name", () => {
    document.cookie = "test_cookie=hello";

    const value = getCookie("test_cookie");

    expect(value).toBe("hello");
  });

  it("getCookie returns null when cookie does not exist", () => {
    document.cookie = "";

    const value = getCookie("missing_cookie");

    expect(value).toBe(null);
  });
});

it("setCookie sets cookie value (encoded) and getCookie reads it back", () => {
  document.cookie = "";

  setCookie("k1", "a b");

  const stored = getCookie("k1");
  expect(stored).toBe("a b");
});

it("setAccessTokenCookie stores access token and getAccessTokenFromCookie reads it", () => {
  document.cookie = "";

  setAccessTokenCookie("token123");

  const token = getAccessTokenFromCookie();
  expect(token).toBe("token123");
});

it("getAccessTokenFromCookie returns null when access token is missing", () => {
  clearAccessTokenCookie();

  const token = getAccessTokenFromCookie();
  expect(token).toBe(null);
});

it("setRefreshTokenCookie stores refresh token and getRefreshTokenFromCookie reads it", () => {
  clearRefreshTokenCookie();

  setRefreshTokenCookie("rt_123");

  const token = getRefreshTokenFromCookie();
  expect(token).toBe("rt_123");
});

it("getRefreshTokenFromCookie returns null when refresh token is missing", () => {
  clearRefreshTokenCookie();

  const token = getRefreshTokenFromCookie();
  expect(token).toBe(null);
});

it("hasRefreshTokenCookie returns false when token is missing", () => {
  clearRefreshTokenCookie();

  const ok = hasRefreshTokenCookie();
  expect(ok).toBe(false);
});

it("hasRefreshTokenCookie returns true when token exists", () => {
  clearRefreshTokenCookie();

  setRefreshTokenCookie("rt_ok");

  const ok = hasRefreshTokenCookie();
  expect(ok).toBe(true);
});

it("getOrCreateFingerprint creates and stores fingerprint when missing", () => {
  window.localStorage.clear();

  const fp = getOrCreateFingerprint();

  expect(typeof fp).toBe("string");
  expect(fp.length).toBeGreaterThan(0);
  expect(window.localStorage.getItem("dc_fingerprint")).toBe(fp);
});

it("getOrCreateFingerprint returns existing fingerprint from localStorage", () => {
  window.localStorage.clear();
  window.localStorage.setItem("dc_fingerprint", "existing_fp");

  const fp = getOrCreateFingerprint();

  expect(fp).toBe("existing_fp");
  expect(window.localStorage.getItem("dc_fingerprint")).toBe("existing_fp");
});

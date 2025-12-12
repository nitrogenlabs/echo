/**
 * Project Echo Dashboard – Store Initialization
 * ----------------------------------------------
 */

import { Flux } from "@nlabs/arkhamjs";
import { EchoStore } from "./echoStore.js";

let initialized = false;

export function initStore(): void {
  if (initialized) return;

  Flux.init({
    name: "echo-dashboard",
    stores: [EchoStore],
    debug: process.env.NODE_ENV !== "production",
  });

  initialized = true;
}

export function getEchoState() {
  return Flux.getState("echo") ?? {
    devices: {},
    models: {},
    sessions: {},
  };
}


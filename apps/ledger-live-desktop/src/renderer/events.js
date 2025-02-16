// @flow
import { ipcRenderer } from "electron";
import debug from "debug";
import { killInternalProcess } from "./reset";
import { lock } from "./actions/application";
import { hasEncryptionKey } from "~/renderer/storage";

const CHECK_UPDATE_DELAY = 5000;

const d = {
  // FIXME we should not use debug library. we have our own log() for this!
  sync: debug("lwd:sync"),
  update: debug("lwd:update"),
};

export function sendEvent(channel: string, msgType: string, data: any) {
  ipcRenderer.send(channel, {
    type: msgType,
    data,
  });
}

export default ({ store }: { store: Object }) => {
  // Ensure all sub-processes are killed before creating new ones (dev mode...)
  killInternalProcess();

  ipcRenderer.on("lock", async () => {
    if (await hasEncryptionKey("app", "accounts")) {
      store.dispatch(lock());
    }
  });
};

export function checkUpdates() {
  d.update("Update - check");
  setTimeout(() => sendEvent("updater", "init"), CHECK_UPDATE_DELAY);
}

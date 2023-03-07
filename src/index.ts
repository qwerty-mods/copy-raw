import { Injector, Logger, common, webpack } from "replugged";
import { Channel, Message } from "discord-types/general";

import { Icon } from "./CopyIcon";
import createModal from "./Modal";

const logger = Logger.plugin("Copy Raw");
const injector = new Injector();

export async function start(): Promise<void> {
  const mod = await webpack.waitForModule(
    webpack.filters.bySource(
      'document.queryCommandEnabled("copy")||document.queryCommandSupported("copy")',
    ),
  );

  const Clipboard: {
    SUPPORTED: boolean;
    copy: (content: string) => unknown;
  } = {
    copy: Object.values(mod).find(e => typeof e === "function") as (args: string) => void,
    SUPPORTED: Object.values(mod).find(e => typeof e === "boolean") as unknown as boolean,
  };

  const classes: Record<string, string> = await webpack.waitForModule(webpack.filters.byProps("labelRow"));

  injector.utils.addPopoverButton((msg: Message, _: Channel) => {
    return {
      key: "copyraw",
      label: "View Raw(L) Copy Raw(R)",
      icon: Icon,
      onClick: () => {
        createModal(msg, Clipboard, classes);
      },
      onContextMenu: () => {
        if (Clipboard.SUPPORTED) {
          Clipboard.copy(msg.content);
          common.toast.toast("Copied to clipboard!", common.toast.Kind.SUCCESS);
        } else {
          common.toast.toast("Your browser does not support copying to clipboard", common.toast.Kind.SUCCESS);
        }
      },
    };
  });
}

export function stop(): void {
  injector.uninjectAll();
}

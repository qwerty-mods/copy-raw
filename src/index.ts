import { /*Logger,*/ api, types, webpack } from "replugged";
import { Channel, Message } from "discord-types/general";

import { Icon } from "./CopyIcon";

// const logger = Logger.plugin("Copy Raw");

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
    copy: webpack.getFunctionBySource<(content: string) => unknown>(
      "copy",
      mod as types.ObjectExports,
    )!,
    SUPPORTED: webpack.getFunctionBySource((e) => {
      console.log(e);
      return typeof e === "boolean";
    }, mod as types.ObjectExports) as unknown as boolean,
  };

  api.messagePopover.addButton("copyraw", (msg: Message, channel: Channel) => {
    return {
      key: "copyraw",
      label: "Copy Raw",
      icon: Icon,
      message: msg,
      channel,
      onClick: () => console.log("omg"),
      onContextMenu: () => {
        console.log(msg, Clipboard);
        Clipboard.copy(msg.content);
      },
    };
  });
}

export function stop(): void {
  api.messagePopover.removeButton("copyraw");
}

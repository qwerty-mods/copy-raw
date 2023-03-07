import { common, components } from "replugged";
import { Message } from "discord-types/general";
const {
  Modal: { ModalRoot, ModalHeader, ModalContent, ModalFooter, ModalCloseButton },
  Button,
  Divider,
  Text,
} = components;
const { modal } = common;

function sortObject<T extends object>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).sort(([k1], [k2]) => k1.localeCompare(k2))) as T;
}

function cleanMessage(msg: Message) {
  const clone = sortObject(JSON.parse(JSON.stringify(msg)));
  for (const key in clone.author) {
    switch (key) {
      case "id":
      case "username":
      case "usernameNormalized":
      case "discriminator":
      case "avatar":
      case "bot":
      case "system":
      case "publicFlags":
        break;
      default:
        // phone number, email, etc
        delete clone.author[key];
    }
  }

  return clone;
}

type ClipboardType = {
  SUPPORTED: boolean;
  copy: (content: string) => unknown;
};

export default function (msg: Message, Clipboard: ClipboardType, classes: Record<string, string>) {
  msg = cleanMessage(msg);
  const msgJson = JSON.stringify(msg, null, 4);
  let modalKey: string;

  modalKey = modal.openModal((props) => (
    <ModalRoot {...props} size="large">
      <ModalHeader>
        <Text variant="heading-lg/semibold" style={{ flexGrow: 1 }}>
          View Raw
        </Text>
        <ModalCloseButton onClick={() => modal.closeModal(modalKey)} />
      </ModalHeader>
      <ModalContent>
        <div style={{ padding: "16px 0" }}>
          {Boolean(msg.content) && (
            <>
              <Text.Eyebrow style={{ marginBottom: 5 }}>Content</Text.Eyebrow>
              <div style={{ userSelect: "text" }}>
                {common.parser.defaultRules.codeBlock.react(
                  { content: msg.content, lang: "" },
                  null,
                  {},
                )}
              </div>
              <Divider className={classes.dividerDefault} style={{ marginBottom: 10 }} />
            </>
          )}

          <Text.Eyebrow style={{ marginBottom: 5 }}>Message Data</Text.Eyebrow>
          <div style={{ userSelect: "text" }}>
            {common.parser.defaultRules.codeBlock.react(
              { content: msgJson, lang: "json " },
              null,
              {},
            )}
          </div>
        </div>
      </ModalContent>
      <ModalFooter>
        <Button
          onClick={() => {
            if (Clipboard.SUPPORTED) {
              Clipboard.copy(msgJson);
              common.toast.toast("Copied to clipboard!", common.toast.Kind.SUCCESS);
            } else {
              common.toast.toast(
                "Your browser does not support copying to clipboard",
                common.toast.Kind.SUCCESS,
              );
            }
          }}
          style={{ marginLeft: 16 }}
          color={Button.Colors.GREEN}>
          Copy Message JSON
        </Button>
        <Button
          onClick={() => {
            if (Clipboard.SUPPORTED) {
              Clipboard.copy(msg.content);
              common.toast.toast("Copied to clipboard!", common.toast.Kind.SUCCESS);
            } else {
              common.toast.toast(
                "Your browser does not support copying to clipboard",
                common.toast.Kind.SUCCESS,
              );
            }
          }}
          color={Button.Colors.GREEN}>
          Copy Raw Content
        </Button>
      </ModalFooter>
    </ModalRoot>
  ));
}

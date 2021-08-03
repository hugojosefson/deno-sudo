import { Message, MessageType } from "./message.ts";

export type ListenerRemover = () => void;
export type Listener<M extends Message> = (event: M) => void;
type Listeners<M extends Message> = Set<Listener<M>>;

export class MessageManager {
  private isDisposedOf = false;
  private readonly listenersByMessageType: Map<
    MessageType,
    Listeners<Message>
  > = new Map<
    MessageType,
    Listeners<Message>
  >();

  private getListenersByType<M extends Message>(type: M["type"]): Listeners<M> {
    if (this.isDisposedOf) return new Set<Listener<M>>();

    const listeners: Listeners<M> = this.listenersByMessageType.get(type) ??
      new Set();

    if (!this.listenersByMessageType.has(type)) {
      this.listenersByMessageType.set(type, listeners as Listeners<Message>);
    }

    return listeners;
  }

  addMessageListener<M extends Message, T extends M["type"]>(
    type: T,
    listener: Listener<M>,
  ): ListenerRemover {
    if (this.isDisposedOf) return () => {};

    const listenersByType: Set<Listener<M>> = this.getListenersByType(type);
    listenersByType.add(listener);

    return () => {
      if (this.isDisposedOf) return;
      listenersByType.delete(listener);
    };
  }

  sendMessage(message: Message) {
    if (this.isDisposedOf) return;

    new Set([
      ...this.getListenersByType(message.type).values(),
      ...this.getListenersByType("*").values(),
    ]).forEach((listener) => {
      try {
        listener(message);
      } catch (error) {
        console.error(
          `Message listener function threw an Error while receiving Message of type ${
            JSON.stringify(message.type)
          }.`,
          {
            error,
            message: message,
          },
        );
      }
    });
  }

  dispose() {
    this.isDisposedOf = true;
    this.listenersByMessageType.forEach((listeners) => listeners.clear());
    this.listenersByMessageType.clear();
  }
}

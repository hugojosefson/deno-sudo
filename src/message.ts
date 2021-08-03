export type Message = Ready | Import | Any;
export type MessageType = Message["type"];

export interface Ready {
  type: "ready";
}

export interface Import {
  type: "import";
  url: URL;
}

interface Any {
  type: "*";
}

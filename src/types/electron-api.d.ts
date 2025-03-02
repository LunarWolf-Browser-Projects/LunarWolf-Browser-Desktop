interface Window {
    electron: {
      send: (channel: string, data: any) => void;
      on: (channel: string, callback: (...args: any[]) => void) => void;
    };
  }
  
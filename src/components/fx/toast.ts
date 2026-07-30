export type ToastTone = "ok" | "info" | "warn";

export interface ToastPayload {
  msg: string;
  tone: ToastTone;
}

export const toast = (msg: string, tone: ToastTone = "ok") => {
  window.dispatchEvent(
    new CustomEvent<ToastPayload>("wvf-toast", { detail: { msg, tone } }),
  );
};

export const TOAST_EVENT = "wvf-toast";

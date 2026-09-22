import { toast } from 'sonner';

export class ToastService {
  private static _toast = toast;

  static get toast() {
    return this._toast;
  }

  static setToast(toastFn: typeof toast) {
    this._toast = toastFn;
  }
}

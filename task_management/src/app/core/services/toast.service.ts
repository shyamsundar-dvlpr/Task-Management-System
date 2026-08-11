import { Injectable, signal } from "@angular/core";

export interface ToastMessage{
    text: string;
    type: 'error' | 'success' | 'info';
}

@Injectable({
    providedIn:'root'
})

export class ToastService {
private _toasts = signal<ToastMessage[]>([]);
toasts=this._toasts.asReadonly();

show(text: string, type: ToastMessage['type'] = 'error') {
    this._toasts.update(list=> [...list,{text, type}]);
    setTimeout(() => this._toasts.update(list => list.slice(1)),4000);
}

error(text: string) {
    this.show(text, 'error');
}

success(text: string) {
    this.show(text, 'success');
}

info(text: string) {
    this.show(text, 'info');
}

}
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
import { bound } from "./decorator/bindThis.js";
let TaskForm = (() => {
    let _instanceExtraInitializers = [];
    let _submitHandler_decorators;
    return class TaskForm {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _submitHandler_decorators = [bound];
            __esDecorate(this, null, _submitHandler_decorators, { kind: "method", name: "submitHandler", static: false, private: false, access: { has: obj => "submitHandler" in obj, get: obj => obj.submitHandler }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        element = __runInitializers(this, _instanceExtraInitializers);
        titleInputEL;
        descriptionInputEL;
        constructor() {
            this.element = document.querySelector("#task-form");
            this.titleInputEL = document.querySelector("#form-title");
            this.descriptionInputEL = document.querySelector("#form-description");
            this.bindEvents();
        }
        makeNewTask() {
            return {
                title: this.titleInputEL.value,
                description: this.descriptionInputEL.value,
            };
        }
        clearInputs() {
            this.titleInputEL.value = "";
            this.descriptionInputEL.value = "";
        }
        submitHandler(event) {
            event.preventDefault(); // ブラウザのデフォルトの動作をキャンセル
            const task = this.makeNewTask();
            console.log(task);
            this.clearInputs();
        }
        bindEvents() {
            // addEventListenerに直接メソッドを渡すと以下のエラーが発生する
            // エラー内容：
            // kanban.js:14 Uncaught TypeError: Cannot read properties of undefined (reading 'value')
            //     at HTMLFormElement.submitHandler (kanban.js:14:39)
            // submitHandler @ kanban.js:14Understand this error
            // ここでのthisはTaskFormのインスタンスではなく、イベントを発生させたform要素を指す
            // そのため、forms要素のtitleInputELがundefinedと評価されてしまう
            this.element.addEventListener("submit", this.submitHandler);
            // これを回避するためには以下のようにbindをつかってインスタンスを束縛する必要がある
            // 今回はdecoratorを学習したので、bindThis.tsにdecoratorを使って実装する
            // this.element.addEventListener("submit", this.submitHandler.bind(this));
            // MEMO: ちなみに引数に処理を直接渡すとちゃんと動く
            // this.element.addEventListener("submit", (event: Event) => {
            //   event.preventDefault();
            //   console.log(this.titleInputEL.value);
            //   console.log(this.descriptionInputEL.value);
            // });
        }
    };
})();
new TaskForm();
// as constを使って読み取り専用のタプル型にする
const TASK_STATUS = ["todo", "working", "done"];
class TaskList {
    templateEL;
    element;
    taskStatus;
    constructor(templateId, _taskStatus) {
        this.templateEL = document.querySelector(templateId);
        const clone = this.templateEL.content.cloneNode(true);
        this.element = clone.firstElementChild;
        this.taskStatus = _taskStatus;
        this.setup();
    }
    setup() {
        this.element.querySelector("h2").textContent = `${this.taskStatus}`;
        this.element.querySelector("ul").id = `${this.taskStatus}`;
    }
    mount(selector) {
        const targetEL = document.querySelector(selector);
        targetEL?.insertAdjacentElement("beforeend", this.element);
    }
}
TASK_STATUS.forEach((status) => {
    const list = new TaskList("#task-list-template", status);
    list.mount("#container");
});

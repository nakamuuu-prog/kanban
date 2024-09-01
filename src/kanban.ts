import { bound } from "./decorator/bindThis.js";

interface Task {
  title: string;
  description?: string;
}

class TaskForm {
  element: HTMLFormElement;
  titleInputEL: HTMLInputElement;
  descriptionInputEL: HTMLTextAreaElement;

  constructor() {
    this.element = document.querySelector("#task-form")!;

    this.titleInputEL = document.querySelector("#form-title")!;
    this.descriptionInputEL = document.querySelector("#form-description")!;

    this.bindEvents();
  }

  private makeNewTask(): Task {
    return {
      title: this.titleInputEL.value,
      description: this.descriptionInputEL.value,
    };
  }

  private clearInputs(): void {
    this.titleInputEL.value = "";
    this.descriptionInputEL.value = "";
  }

  @bound
  private submitHandler(event: Event) {
    event.preventDefault(); // ブラウザのデフォルトの動作をキャンセル

    const task = this.makeNewTask();
    console.log(task);

    this.clearInputs();
  }

  private bindEvents() {
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
}

new TaskForm();

// as constを使って読み取り専用のタプル型にする
const TASK_STATUS = ["todo", "working", "done"] as const;
// インデックスアクセス型という、他の型から特定の部分を抽出するツールを使ってTuple型から各要素の型を抽出する
// インデックスアクセス型を利用することで 型名[プロパティ名] の形式で、型の特定の部分にアクセスできるようになる
type TaskStatus = (typeof TASK_STATUS)[number];

class TaskList {
  templateEL: HTMLTemplateElement;
  element: HTMLDivElement;
  private taskStatus: TaskStatus;

  constructor(templateId: string, _taskStatus: TaskStatus) {
    // templateの内容を取り込む
    this.templateEL = document.querySelector(templateId)!;
    // templateのクローンを作る
    // cloneNodeにtrueを渡すことでtemplate要素のすべての子要素および、その下層の要素も含めた完全なクローンができる
    // template要素のcontentプロパティはDocumentFragment型なので、アサーションを使用してcloneをDocumentFragment型として扱う
    // MEMO:(参照先)
    // /**
    //  * Returns the template contents (a DocumentFragment).
    //  *
    //  * [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLTemplateElement/content)
    //  */
    // readonly content: DocumentFragment;
    const clone = this.templateEL.content.cloneNode(true) as DocumentFragment;

    this.element = clone.firstElementChild as HTMLDivElement;

    this.taskStatus = _taskStatus;

    this.setup();
  }

  setup() {
    this.element.querySelector("h2")!.textContent = `${this.taskStatus}`;
    this.element.querySelector("ul")!.id = `${this.taskStatus}`;
  }

  mount(selector: string) {
    const targetEL = document.querySelector(selector);
    targetEL?.insertAdjacentElement("beforeend", this.element);
  }
}

TASK_STATUS.forEach((status) => {
  const list = new TaskList("#task-list-template", status);
  list.mount("#container");
});

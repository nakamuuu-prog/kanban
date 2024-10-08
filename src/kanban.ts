import { bound } from "./decorator/bindThis.js";

interface Task {
  title: string;
  description?: string;
}

class TaskForm {
  element: HTMLFormElement;
  titleInputEl: HTMLInputElement;
  descriptionInputEl: HTMLTextAreaElement;

  constructor() {
    this.element = document.querySelector("#task-form")!;

    this.titleInputEl = document.querySelector("#form-title")!;
    this.descriptionInputEl = document.querySelector("#form-description")!;

    this.bindEvents();
  }

  private makeNewTask(): Task {
    return {
      title: this.titleInputEl.value,
      description: this.descriptionInputEl.value,
    };
  }

  private clearInputs(): void {
    this.titleInputEl.value = "";
    this.descriptionInputEl.value = "";
  }

  @bound
  private submitHandler(event: Event) {
    event.preventDefault(); // ブラウザのデフォルトの動作をキャンセル

    const task = this.makeNewTask();

    const item = new TaskItem(task);
    item.mount("#todo");

    this.clearInputs();
  }

  private bindEvents() {
    // addEventListenerに直接メソッドを渡すと以下のエラーが発生する
    // エラー内容：
    // kanban.js:14 Uncaught TypeError: Cannot read properties of undefined (reading 'value')
    //     at HTMLFormElement.submitHandler (kanban.js:14:39)
    // submitHandler @ kanban.js:14Understand this error

    // ここでのthisはTaskFormのインスタンスではなく、イベントを発生させたform要素を指す
    // そのため、forms要素のtitleInputElがundefinedと評価されてしまう
    this.element.addEventListener("submit", this.submitHandler);

    // これを回避するためには以下のようにbindをつかってインスタンスを束縛する必要がある
    // 今回はdecoratorを学習したので、bindThis.tsにdecoratorを使って実装する
    // this.element.addEventListener("submit", this.submitHandler.bind(this));

    // MEMO: ちなみに引数に処理を直接渡すとちゃんと動く
    // this.element.addEventListener("submit", (event: Event) => {
    //   event.preventDefault();
    //   console.log(this.titleInputEl.value);
    //   console.log(this.descriptionInputEl.value);
    // });
  }
}

new TaskForm();

// TaskListとTaskItem用の抽象クラスを作成して共通化する
// ジェネリクス型をHTMLElementで制約することで、HTMLElementまたは、そのサブクラスの型のみを受け入れられるようにする
abstract class UIComponent<T extends HTMLElement> {
  templateEl: HTMLTemplateElement;
  element: T;

  constructor(templateId: string) {
    // templateの内容を取り込む
    this.templateEl = document.querySelector(templateId)!;
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
    const clone = this.templateEl.content.cloneNode(true) as DocumentFragment;
    this.element = clone.firstElementChild as T;
  }

  mount(selector: string) {
    const targetEl = document.querySelector(selector);
    targetEl?.insertAdjacentElement("beforeend", this.element);
  }

  // setupはTaslListとTaskItemでセットアップする要素が異なるので、抽象メソッドとして実装しておいて、オーバーライドして使う
  abstract setup(): void;
}

// as constを使って読み取り専用のタプル型にする
const TASK_STATUS = ["todo", "working", "done"] as const;
// インデックスアクセス型という、他の型から特定の部分を抽出するツールを使ってTuple型から各要素の型を抽出する
// インデックスアクセス型を利用することで 型名[プロパティ名] の形式で、型の特定の部分にアクセスできるようになる
type TaskStatus = (typeof TASK_STATUS)[number];

class TaskList extends UIComponent<HTMLDivElement> {
  constructor(private taskStatus: TaskStatus) {
    super("#task-list-template");

    this.setup();
  }

  setup() {
    this.element.querySelector("h2")!.textContent = `${this.taskStatus}`;
    this.element.querySelector("ul")!.id = `${this.taskStatus}`;
  }
}

TASK_STATUS.forEach((status) => {
  const list = new TaskList(status);
  list.mount("#container");
});

// クリック用のインターフェイスを導入することで、クリック可能な要素と、その振る舞いを規定する明確な契約を設定できる
interface ClickableElement {
  element: HTMLElement;
  clickHandler(event: MouseEvent): void;
  bindEvents(): void;
}

class TaskItem extends UIComponent<HTMLLIElement> implements ClickableElement {
  task: Task;

  constructor(_task: Task) {
    super("#task-item-template");

    this.task = _task;
    this.setup();
    this.bindEvents();
  }

  setup() {
    this.element.querySelector("h2")!.textContent = `${this.task.title}`;
    this.element.querySelector("p")!.textContent = `${this.task.description}`;
  }

  @bound
  clickHandler() {
    if (!this.element.parentElement) return;

    const currentListId = this.element.parentElement.id as TaskStatus;
    const taskStatusIdx = TASK_STATUS.indexOf(currentListId);

    if (taskStatusIdx === -1) {
      throw new Error("タスクステータスが不正です。");
    }

    const nextlistId = TASK_STATUS[taskStatusIdx + 1];

    if (nextlistId) {
      const nextListEl = document.getElementById(
        nextlistId
      ) as HTMLUListElement;
      nextListEl.appendChild(this.element);
      return;
    }

    // 現在の要素がdoneの場合はリストから削除する
    this.element.remove();
  }

  bindEvents() {
    this.element.addEventListener("click", this.clickHandler);
  }
}

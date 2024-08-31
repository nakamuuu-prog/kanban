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

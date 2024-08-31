export function bound<This, Args extends any[], Return>(
  _originalMethod: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<
    This,
    (this: This, ...args: Args) => Return
  >
) {
  context.addInitializer(function (this: any) {
    // インスタンスの束縛
    this[context.name] = this[context.name].bind(this);
  });
}

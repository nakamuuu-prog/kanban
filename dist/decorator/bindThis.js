export function bound(_originalMethod, context) {
    context.addInitializer(function () {
        // インスタンスの束縛
        this[context.name] = this[context.name].bind(this);
    });
}

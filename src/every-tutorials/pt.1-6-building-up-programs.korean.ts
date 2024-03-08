import { Console, Effect } from "effect";

// 지금까지 우리의 프로그램은 꽤 제한적입니다
// 우리는 매우 기본적인 이펙트만을 생성할 수 있고
// 그 결과에 무언가를 하기 위해서는 그것들을 실행해야만 합니다

// 하지만 '실제' 프로그램은 그것보다 훨씬 더 복잡하죠, 맞나요?
// 데이터의 지속적인 변환을 포함합니다

const getDate = () => Date.now();
const double = (x: number) => x * 2;
const toString = (x: number) => x.toString();
const toUpperCase = (x: string) => x.toUpperCase();

// 우리는 이러한 함수들을 함께 연결하여 프로그램을 만들 수 있습니다

const program = () => toUpperCase(toString(double(getDate())));
console.log(program());

// 이것에 대해 뭐가 이상한가요?
// 데이터의 흐름을 보기 어렵고, 읽기 어렵습니다

// 객체지향은 데이터가 스스로를 변환하도록 함수를 제공하라고 말합니다, 메소드 문법으로요
class MyDate {
  value: number;
  constructor() {
    this.value = Date.now();
  }
  double() {
    return this.value * 2;
  }
}

const program2 = () => new MyDate().double().toString().toUpperCase();
// console.log(program2());

// 좋아요, 읽기는 더 쉬워졌지만, 이제 어떤 문제가 있나요?
// 함수들이 데이터에 묶여 있어서 조합성을 잃습니다
// 함수들을 독립적으로 테스트할 수 없습니다
// 그리고 함수들을 트리 쉐이킹할 수 없습니다, 코드가 충분히 길다면 문제가 됩니다

// 그렇다면 해결책은? 파이프입니다!
import { pipe } from "effect";

const program3 = () => pipe(getDate(), double, toString, toUpperCase);

// 파이프는 값을 받고 함수 리스트를 받아
// 순서대로 함수들을 값에 적용하는 함수입니다
// 메소드 문법과 거의 동일하게 보이지만 데이터에 묶여 있지 않다는 점에 주목하세요

// 핵심적인 차이점은 파이프 함수는 단항이어야 한다는 것입니다(하나의 인자를 받음)
// 이는 하나의 함수의 출력이 다음 함수의 입력이 되기 때문입니다
// 따라서 함수가 하나 이상의 인자를 받는 경우, 부분 적용해야 합니다

// 이제 이펙트로 돌아가봅시다!

// 이펙트의 결과에 변환을 적용하고 싶지만, 그것을 실행하지 않으려면 어떻게 해야 할까요?
// 이펙트에서 값을 꺼내는 방법은 무엇일까요?

{
  const getDate = Effect.sync(() => Date.now());
  const double = (x: number) => x * 2;

  const doubleDate = Effect.sync(() => {
    const date = Effect.runSync(getDate);
    return double(date);
  });

  // 이건 하지 마세요...
  // 이펙트를 실행하는 것은 프로그램의 '가장자리'에서 해야 합니다,
  // 이펙트가 외부 세계와 상호작용해야 하는 곳이죠

  // 그렇다면 어떨까요?
  // const doubleDate2 = pipe(getDate, double);

  // 하지만 이건 정확하지 않습니다, 왜냐하면 double은 이펙트를 받는 함수가 아니기 때문입니다
  // 이 변환을 수행하려면 `Effect.map`을 사용할 수 있습니다

  const doubleDate3 = Effect.map(getDate, (x) => double(x));
  // doubleDate3는 새로운 이펙트로, 다음을 나타내는 프로그램입니다:
  // 1. 날짜를 가져옵니다
  // 2. 첫 번째 단계의 결과에 double 함수를 적용합니다
  // 3. 두 번째 단계의 결과를 반환합니다

  // 이렇게 이펙트 안에서 우리 프로그램을 다시 만들 수 있습니다:
  const program = pipe(
    getDate,
    Effect.map((x) => x * 2),
    Effect.map((x) => x.toString()),
    Effect.map((x) => x.toUpperCase())
  );

  // 그리고 실행하기 위해서는
  const result = Effect.runSync(program);

  const _ = Effect.map((x: number) => double(x));
  const __ = Effect.map((x: number) => x.toString())(getDate);
}

// map과 같은 조합자들을 통해
// 우리는 하나의 단일 이펙트로 복잡한 프로그램을 전체적으로 구축할 수 있습니다
// 그리고 마지막에 그것들을 실행할 수 있죠

// 또한 map의 두 가지 오버로드를 주목하세요,
// 이펙트는 그것들을 파이프 안에서 쉽게, 또는 그 자체로 사용할 수 있도록 허용합니다
// 이것은 이펙트 내의 거의 모든 조합자에 해당됩니다

{
  const divide = (a: number, b: number): Effect.Effect<number, Error> =>
    b === 0
      ? Effect.fail(new Error("0으로 나눌 수 없습니다"))
      : Effect.succeed(a / b);

  const program = pipe(
    Effect.succeed([25, 5] as const),
    Effect.map(([a, b]) => divide(a, b))
  );

  // 이제 자체적으로 이펙트를 반환하는 함수로 map을 사용해 봅시다
  // 오, 이펙트<이펙트<number, Error>>가 우리가 원하는 것이 아닙니다
  // 중첩된 이펙트를 '평탄화'할 필요가 있는데요

  const program2 = pipe(
    Effect.succeed([25, 5] as const),
    Effect.flatMap(([a, b]) => divide(a, b))
  );

  // 훨씬 나아졌습니다
  // 이를 이해하기 위해 bash 명령어 ls | grep .json을 고려해 보세요
  // ls는 텍스트를 출력하는 자체 프로그램입니다
  // grep은 텍스트를 받아 그 중 일부를 출력하는 프로그램입니다
  // | 연산자는 이펙트에서의 flatMap과 같습니다
  // 첫 번째 프로그램의 출력을 두 번째 프로그램에 공급합니다
  // 그 결과, ls | grep .json 자체가 전체 작업 시퀀스를 나타내는 프로그램입니다
}

{
  const program = pipe(
    Effect.sync(() => Date.now()),
    Effect.map((x) => x * 2),
    Effect.map((x) => x.toString()),
    Effect.map((x) => x.toUpperCase())
  );

  // 이 프로그램을 다시 보면
  // 어떤 단계의 결과를 로그하고 싶다면 어떻게 할까요?

  const program2 = pipe(
    Effect.sync(() => Date.now()),
    Effect.map((x) => x * 2),
    Effect.map((x) => {
      console.log(x);
      return x;
    }),
    Effect.map((x) => x.toString()),
    Effect.map((x) => x.toUpperCase())
  );

  // 값을 반환해야 하므로 다음 단계로 전달될 수 있습니다
  // 하지만 이는 이상적이지 않습니다, 왜냐하면 우리는 실제로 값을 변환하지 않기 때문입니다
  // 따라서 다음으로 볼 컴비네이터는 Effect.tap입니다.
  // 이것은 기본적으로 Effect.map과 같지만, 결과 이펙트의 값은 변환되지 않습니다.

  const program3 = pipe(
    Effect.sync(() => Date.now()),
    Effect.map((x) => x * 2),
    Effect.tap((x) => console.log(x)),
    // 위의 코드는 void를 반환하지만, 값은 여전히 다음 단계로 전달됩니다
    Effect.map((x) => x.toString()),
    Effect.map((x) => x.toUpperCase())
  );

  // 마지막으로 Effect.all을 살펴보겠습니다.
  // 이것은 이펙트 배열을 받아 그 결과의 배열을 반환하는 이펙트를 반환합니다.

  const getDate = Effect.sync(() => Date.now());
  const yesterday = Effect.sync(() => Date.now() - 24 * 60 * 60 * 1000);
  const both = Effect.all([getDate, yesterday]);
  const program4 = pipe(
    Effect.all([getDate, yesterday]),
    Effect.map(([x, y]) => x + y)
  );

  // Effect.all의 멋진 점은 이펙트가 값인 객체도 받을 수 있고
  // 그 결과의 객체를 반환하는 이펙트를 반환한다는 것입니다.
  const program5 = pipe(
    Effect.all({ x: getDate, y: yesterday }),
    Effect.map(({ x, y }) => x + y)
  );
}

// 마지막으로, 이펙트 생성기를 살펴보겠습니다.
// 이것은 이펙트를 구성하고 조합하는 대안적인 방법입니다.
{
  // 앞서 보았던 프로그램을 다시 살펴보겠습니다(일부 수정 포함)
  const divide = (a: number, b: number): Effect.Effect<number, Error> =>
    b === 0
      ? Effect.fail(new Error("0으로 나눌 수 없습니다"))
      : Effect.succeed(a / b);

  const program = pipe(
    Effect.sync(() => Date.now()),
    Effect.map((x) => x * 2),
    Effect.flatMap((x) => divide(x, 3)),
    Effect.map((x) => x.toString())
  );

  // 이것은 프로미스 체인과 비슷하게 보이나요?
  // 그 이유는 둘 다 값을 감싸는 래퍼 주위에 변환을 적용하는 체인 형태를 사용하기 때문입니다.

  // 그래서 여기서 async / await가 등장합니다.
  // 연속된 변환들을 동기적으로 보이는 방식으로 작성할 수 있게 합니다.
  async function program2() {
    const x = await Promise.resolve(Date.now());
    const y = x * 2;
    const z = await new Promise<number>((res, rej) =>
      y === 0 ? rej("0으로 나눌 수 없습니다") : res(y / 3)
    );
    return z.toString();
  }

  // 이펙트는 자바스크립트 생성기를 사용하여 완전히 같은 방식으로 동작하는 자체 버전의 async / await를 가집니다.
  const before = pipe(
    Effect.sync(() => Date.now()),
    Effect.map((x) => x * 2),
    Effect.flatMap((x) => divide(x, 3)),
    Effect.map((x) => x.toString())
  );
  // after: Effect<string, Error>
  const after = Effect.gen(function* (_) {
    // x는 숫자입니다! 'yield'는 'await'와 같습니다
    const x = yield* _(Effect.sync(() => Date.now()));
    const y = x * 2;
    const z = yield* _(divide(y, 3));
    // 오류는 자동으로 반환 타입에 전파됩니다
    return z.toString();
  });

  // 이것은 프로그램을 일련의 '계속됨'으로 분리하고 그것들을 연결하는 것과 정확히 동일한 개념을 통해 작동합니다

  // 일반 함수로 할 수 있는 모든 것을 제너레이터로 할 수 있고, 그 반대의 경우도 마찬가지입니다
  // 하지만 대부분의 경우 제너레이터가 더 편안하게 작업할 수 있게 해주며
  // 모두가 익숙해진 async / await 문법과 유사한 코드를 허용합니다

  // `yield*`와 `_()`가 단순한 `yield` 대신 사용되는 이유가 궁금할 수 있습니다
  // 이는 올바른 타입 추론을 얻기 위한 타입스크립트의 한계 때문입니다
  // 이른바 '어댑터'가 필요하며, 대부분의 사람들은 이를 `_`로 별칭하지만 과거에는 `$`가 사용되었습니다
  // 이의 한 가지 이점은 어댑터 역시 파이프 함수라는 것입니다
  const gen = Effect.gen(function* (_) {
    const x = yield* _(
      Effect.succeed(5),
      Effect.map((x) => x * 2),
      Effect.map((x) => x.toString())
    );
    const y = yield* _(Effect.succeed(10));
    return x + y;
  });
}

// 마지막으로, `pipe` 메서드를 살펴보겠습니다, 이는 이펙트의 대부분의 타입에서 사용할 수 있습니다
// 단순히 첫 번째 인자가 이미 입력된 `pipe` 함수의 축약형입니다

const before = pipe(
  Effect.succeed(5),
  Effect.map((x) => x * 2),
  Effect.map((x) => x.toString())
);

const after = Effect.succeed(5).pipe(
  Effect.map((x) => x * 2),
  Effect.map((x) => x.toString())
);

// zipRight 대 FlatMap에 대한 사측 메모

// `Effect.zip`도 있습니다, 이는 기본적으로 `Effect.all`이지만 오직 두 개의 이펙트에 대해서만 해당합니다
const zipped = Effect.zip(Effect.succeed("hi"), Effect.succeed(10));

// 그리고 `Effect.zipLeft`는 `Effect.flatMap`과 유사하지만 두 번째 이펙트의 결과가 무시됩니다
const zippedLeft = Effect.zipLeft(Effect.succeed("hi"), Effect.succeed(10));

// 그리고 `Effect.zipRight`는 `Effect.flatMap`과 유사하지만 첫 번째 이펙트의 결과가 무시됩니다
const zippedRight = Effect.zipRight(Effect.succeed("hi"), Effect.succeed(10));

// 때로는 `Effect.zipRight`와 `Effect.flatMap`을 언제 사용해야 하는지 혼란스러울 수 있습니다
// 하지만 차이점은 두 번째 이펙트가 첫 번째 이펙트의 결과에 의존하는지 여부입니다
// 의존한다면 `Effect.flatMap`을 사용하고, 그렇지 않다면 `Effect.zipRight`을 사용하세요
// 물론 입력을 무시하는 함수로 `Effect.flatMap`을 사용할 수도 있습니다
const one = Effect.flatMap(Effect.succeed(5), (x) => Console.log(x));
const two = Effect.flatMap(Effect.succeed(5), () => Console.log("hi"));
const three = Effect.zipRight(Effect.succeed(5), Console.log("hi"));

// 그 경우 `Effect.zipRight`을 사용하는 것이 더 명시적입니다
// `flatMap`은 "첫 번째 이펙트의 결과로 이것을 수행하라"고 말합니다
// `zipRight`은 "첫 번째 이펙트 이후에 이것을 단순히 수행하라"고 말합니다

// `zipLeft`과 `tap`도 마찬가지입니다
const four = Effect.tap(Effect.succeed(5), (x) => Console.log(x));
const five = Effect.tap(Effect.succeed(5), () => Console.log("hi"));
const six = Effect.zipLeft(Effect.succeed(5), Console.log("hi"));

// 또는 그 모든 것을 무시하고 `Effect.andThen`을 사용할 수 있습니다
// 이는 값, 프로미스, 또는 이펙트... 또는 그 어느 것이든 반환하는 함수를 받을 수 있습니다

const foo = Effect.succeed(5);

const seven = Effect.andThen(foo, "hi");
const eight = Effect.andThen(foo, Promise.resolve("hi"));
const nine = Effect.andThen(foo, Effect.succeed("hi"));
const ten = Effect.andThen(foo, (x) => `hi ${x}`);
const eleven = Effect.andThen(foo, (x) => Promise.resolve(`hi ${x}`));
const twelve = Effect.andThen(foo, (x) => Console.log(`hi ${x}`));


// 흥미롭게도 동기 버전은 에러를 던지지 않는 것으로 신뢰되지만
// 비동기 버전은 그렇지 않습니다 - *어깨를 으쓱*

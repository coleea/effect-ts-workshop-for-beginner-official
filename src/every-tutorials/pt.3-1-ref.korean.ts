import { Effect, Ref, Schedule, SynchronizedRef } from "effect";
// 프로그램의 다른 부분들 사이에서 변경 가능한 상태를 공유하는 것은 흔한 문제입니다.
// 하지만 이는 변수와 값에 의한 전달 대 참조에 의한 전달로 인해 어려워질 수 있습니다.

// 이 문제에 대한 Effects의 해결책은 `Ref` 타입입니다.
// `React`나 `Vue`를 사용해본 적이 있다면 `Ref`가 무엇인지 아마 알고 있을 것입니다.
// 기본적으로 `current` 속성이 있는 객체이며, 이 속성은 변경될 수 있습니다.
// 객체는 참조에 의해 전달되기 때문에, 프로그램의 다른 부분들 사이에서 같은 `Ref`를 공유할 수 있습니다.
// 그리고 다른 위치에서 같은 값을 접근할 수 있습니다.

// 추가적으로, `Ref`에서의 모든 작업은 효과적입니다,

const one = Effect.gen(function* (_) {
  const ref = yield* _(Ref.make(1));
  yield* _(Ref.update(ref, (n) => n + 1));
  return yield* _(Ref.get(ref));
});

// 이는 동시성 환경에서 상태를 공유하고 싶을 때 유용해집니다

const increfmentRef = (ref: Ref.Ref<number>) => Ref.update(ref, (n) => n + 1);
const logRef = (ref: Ref.Ref<number>) =>
  Ref.get(ref).pipe(Effect.flatMap((s) => Effect.log(s)));

const two = Effect.gen(function* (_) {
  const ref = yield* _(Ref.make(1));

  const logFiber = yield* _(
    logRef(ref),
    Effect.repeat(Schedule.spaced("1초 간격")),
    Effect.fork
  );

  const incFiber = yield* _(
    increfmentRef(ref),
    Effect.repeat(Schedule.spaced("100밀리")),
    Effect.fork
  );

  yield* _(Effect.sleep("5초"));
});

// Effect.runPromise(two);

// SynchronizedRef는 기본적으로 같은 것이지만, 업데이트가 효과적일 수 있습니다
// 효과적인 작업은 또한 ref를 '잠그므로', 다른 모든 작업은 효과적인 작업이 완료될 때까지 기다려야 합니다

const three = Effect.gen(function* (_) {
  const ref = yield* _(SynchronizedRef.make(1));
  const effectfulInc = (a: number) =>
    SynchronizedRef.updateEffect(ref, (n) =>
      Effect.sleep("1초").pipe(Effect.map(() => n + a))
    );

  const logged = (id: number) =>
    Effect.gen(function* (_) {
      const before = yield* _(SynchronizedRef.get(ref));
      yield* _(Effect.log(`Before ${id}: ${before}`));
      yield* _(effectfulInc(id));
      const after = yield* _(SynchronizedRef.get(ref));
      yield* _(Effect.log(`After ${id}: ${after}`));
    });

  yield* _(
    Effect.all([logged(1), logged(2), logged(3)], { concurrency: "제한 없음" })
  );

  const final = yield* _(SynchronizedRef.get(ref));
  yield* _(Effect.log(`최종: ${final}`));
});

Effect.runPromise(three);

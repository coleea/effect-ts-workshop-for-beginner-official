import {
  Chunk,
  Console,
  Effect,
  Either,
  Option,
  Sink,
  Stream,
  pipe,
} from "effect";

// 잠시 이 두 가지 타입을 고려해 보세요: `T`와 `T[]`
// 이들은 어떤 의미를 공유하고, 어떤 의미가 다른가요?

// `Effect<A, E, R>`이 다음과 같은 프로그램을 묘사하는 값이라면:
// 컨텍스트 `R`이 필요하며, 에러 `E`로 실패할 수 있고, 값 `A`로 성공할 수 있습니다.
// 그러면 `Stream<A, E, R>`은 다음과 같은 프로그램을 묘사하는 값입니다:
// 컨텍스트 `R`이 필요하며, 에러 `E`로 실패할 수 있고, 값 `A`를 0개 또는 여러 개 성공할 수 있습니다.

// 스트림이 0개 또는 여러 개의 값을 가진 이펙트와 같다는 것을 이해한다면,
// 스트림을 이해하는 것은 쉬울 것입니다.

// 이펙트처럼, 스트림도 불변의 값입니다.
// 이펙트처럼, 스트림도 지연 평가되며 에러에 대해서는 단락 평가됩니다.
// 이펙트처럼, 스트림도 finalizer를 가질 수 있습니다.
// 기본적으로 모든 이펙트 조합자에는 스트림에 해당하는 것이 있습니다.

// 이펙트가 결코 성공하지 않을 수 있듯이, 스트림은 무한한 값을 산출할 수 있습니다.

// 간단한 스트림 몇 가지를 살펴봅시다.

Stream.empty;
Stream.unit;
Stream.succeed(1);
Stream.make(1, 2, 3);
Stream.range(1, 10);
Stream.iterate(1, (n) => n + 1);
Stream.fromIterable([1, 2, 3]);
Stream.fromEffect(Effect.sync(() => Date.now()));

// 그 외 많은 것들...

// 이펙트와 마찬가지로, 매핑, 탭핑, 필터링, 집합, 그리고 더 많은 작업을 할 수 있습니다.

// 스트림을 '실행'하기 위해서는 `Stream.run*` 함수를 사용합니다.

// 기억해야 할 핵심은 이러한 함수들이 스트림이 완료될 때만 해결된다는 것입니다.
// 따라서 무한한 스트림을 실행하면 절대로 해결되지 않습니다.
// 그렇다면 무한한 스트림을 어떻게 처리합니까? `Stream.take`를 사용하여 값의 수를 제한할 수 있습니다.
// 하지만 실제로는 스트림이 완료된 후가 아니라 방출될 때 처리합니다.

// 이 스트림을 고려해보세요:
const spacedInts = Stream.asyncInterrupt<number>((emit) => {
  let n = 0;
  const interval = setInterval(() => {
    if (n > 4) {
      clearInterval(interval);
      emit(Effect.fail(Option.none()));
    }
    n++;
    emit(Effect.succeed(Chunk.of(n)));
  }, 250);
  return Either.left(Effect.sync(() => clearInterval(interval)));
});

// 청크란 무엇인가요? 배열과 같은 값의 컬렉션입니다.
// 이것은 스트림의 성능을 향상시킵니다. 왜냐하면 각 값마다 방출하는 데 비용이 들기 때문입니다.
// 그리고 스트림이 한 번에 한 개 이상의 값을 방출하는 경우가 흔합니다.
// 따라라서 개별적으로 각 값을 전송하는 대신에, 우리는 그것들을 청크로 보냅니다.

// Option.none()의 실패를 방출하는 것이 스트림을 멈추게 하는 이유는 무엇인가요?
// 방출할 수 있는 옵션은 세 가지입니다: 성공, 실패, 또는 스트림이 완료되었다는 신호입니다.
// 우리는 Option.none을 사용하여 스트림이 완료되었다는 것을 신호합니다. (Option.some(error)는 실패를 신호할 것입니다)

// 이 스트림을 runCollect 하면, 스트림이 완료될 때까지 값으로 무엇인가를 할 수 없습니다.

const one = Effect.gen(function* (_) {
const collected = yield* _(Stream.runCollect(spacedInts));
for (const value of collected) {
yield* _(Console.log(value));
}
});

// Effect.runPromise(one);

// 하지만 우리가 스트림 내부에서 '처리'를 진행한다면, 값이 방출될 때 그 값들로 무언가를 할 수 있습니다.
const two = Effect.gen(function* (_) {
yield* _(
spacedInts,
Stream.tap((n) => Console.log(n)),
Stream.runDrain
);
});

Effect.runPromise(two);

// 스트림의 맞춤형 소비를 위한 Sink 타입이 있습니다.
// Sink<A, In, L, E, R>는 다음과 같은 프로그램을 묘사합니다:
// Stream<In>을 소비하며, 에러 E로 실패할 수 있고, 컨텍스트 R이 필요하며
// 값 A를 생성하고 타입 L의 남은 값이 있을 수 있습니다.

const sink1 = pipe(
spacedInts,
Stream.run(Sink.sum),
Effect.andThen((sum) => Console.log(sum))
);

// Effect.runPromise(sink1);

const sink2 = pipe(spacedInts, Stream.run(Sink.forEach((n) => Console.log(n))));

// Effect.runPromise(sink2);

// 남은 값들의 예시

const sink3 = pipe(
spacedInts,
Stream.run(Sink.head().pipe(Sink.collectLeftover)),
Effect.andThen(([head, leftover]) => Console.log(head, leftover))
);

// Effect.runPromise(sink3);


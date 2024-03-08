import { Console, Effect, Schedule } from "effect";

// 스케줄은 이펙트풀 연산의 "반복"을 설명하는 값입니다. <- 여기서의 핵심 키워드는 반복이다
// 스케줄 타입: `Schedule<Out, In = unknown, Env = never>`
// 입력 `In`을 받아 출력 `Out`을 반환합니다. 환경 `Env`가 필요합니다

// 스케줄은 성공하는 효과를 반복하거나 실패하는 효과를 재시도하는 데 사용될 수 있습니다.

// 스케줄은 몇 가지 기본 생성자를 가지고 있습니다.

Schedule.once;
Schedule.forever;
Schedule.recurs(5);
Schedule.spaced("1 seconds");
Schedule.fixed("1 seconds");
// 이 두 스케줄이 어떻게 다를 수 있을까요?
Schedule.exponential("1 seconds", 1.2);
Schedule.fibonacci("1 seconds");

// 입력을 사용하여 (주로 이펙트의 결과나 오류가 함수 argument) 다음 반복을 결정합니다.
Schedule.recurWhile((n: number) => n < 10);
// 여기에 더 많은 가능성이 있습니다.

// 출력을 지정합니다.
Schedule.repetitions(Schedule.spaced("1 seconds"));
// 다시, 여기에 더 많은 가능성이 있습니다.

// 스케줄은 합성할 수 있습니다.

Schedule.union(
  Schedule.spaced("1 seconds"),
  Schedule.exponential("200 millis", 1.2)
);

Schedule.intersect(
  Schedule.spaced("1 seconds"),
  Schedule.exponential("200 millis", 1.2)
);

Schedule.andThen(Schedule.recurs(5), Schedule.spaced("1 seconds"));

// 출력을 사용하는 것: 필터링 + 태핑
Schedule.whileOutput(Schedule.spaced("1 seconds"), (n) => n < 10);
Schedule.tapOutput(Schedule.spaced("1 seconds"), (n) => Console.log(n));

// 스케줄 사용하기
const schedule = Schedule.spaced("1 seconds");
const effect = Console.log("Hello, world!");
let counter = 0;
const errors =
  counter < 5 ? Effect.failSync(() => counter++) : Effect.succeed("success");

// 이펙트 반복하기
Effect.repeat(effect, schedule);

// 이펙트 재시도하기
Effect.retry(errors, schedule);

// 기본 스케줄에 대한 축약 메소드가 모두 있습니다.

Effect.repeat(effect, { times: 5 });
Effect.repeat(
  Effect.sync(() => Date.now()),
  { while: (n) => n < Date.now() + 1000 }
);

// 스케줄이 소진된 후에도 효과가 여전히 성공하지 않았을 경우 대체 방안을 지정합니다.
Effect.retryOrElse(Effect.fail(0), Schedule.recurs(5), (error) =>
  Effect.succeed(error)
);

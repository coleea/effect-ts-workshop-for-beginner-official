import { ParseResult } from "@effect/schema";
import * as Schema from "@effect/schema/Schema";
import { Effect } from "effect";

// 데이터의 형태와 유형을 보장하는 것은 안전하고 유지보수가 용이한 코드를 작성하는 데 있어 매우 중요합니다.
// 이는 주로 API, 데이터베이스 또는 사용자 입력과 같은 외부 데이터 소스와 상호 작용할 때 필요합니다.
// 이러한 종류의 기능을 제공하는 많은 라이브러리가 있으며, 당연히 Effect도 포함됩니다.
// Effect의 데이터 유효성 검사 및 변환 라이브러리는 `Schema`라고 합니다.

// 대부분의 유효성 검사 라이브러리는 `unknown`에서 `T`로의 유효성 검사만을 지원하고,
// 그리고 어쩌면 `T`에서 `U`로의 한 방향 변환을 지원할 수 있습니다.

// 스키마는 양방향 변환이 가능하다는 의미로, `T`에서 `U`로 그리고 `U`에서 `T`로의 변환을 지원할 뿐만 아니라,
// `unknown`에서 `T` 또는 `U`로의 유효성 검사도 제공합니다.

// 이 기능은 단일 위치에서 데이터의 직렬화 및 역직렬화를 모두 설명할 수 있기 때문에 매우 강력합니다.

// `Schema<A, I = A, R = never>`는 다음을 설명할 수 있습니다:
// - `unknown` 데이터가 타입 `A`인지 유효성 검사
// - `unknown` 데이터가 타입 `I`인지 유효성 검사
// - `A`를 `I`로 인코딩
// - `I`를 `A`로 디코딩

// `I = A`는 모든 유효성 검사가 변환을 요구하지 않기 때문에 중요합니다.
// 따라서 `Schema<string>`은 데이터가 문자열인지 검증하는 간단한 스키마입니다.
// `R`은 변환에 필요한 서비스를 나타냅니다(변환이 효과적일 수 있음).

// 간단한 예제 스키마를 구축한 다음, 데이터를 유효성 검사하고 변환하는 방법을 살펴보겠습니다.

const string = Schema.string;
// 여기에는 데이터가 문자열인지 검증하는 간단한 스키마가 있습니다.

const number = Schema.number;
// 그리고 여기에는 데이터가 숫자인지 검증하는 간단한 스키마가 있습니다.

// 이제 문자열을 숫자로 유효성 검사하고 변환할 수 있는 Schema<number, string>을 구축해 봅시다.
// `Schema.transform`을 사용할 때, 우선 입력 유형의 스키마를 제공한 다음, 출력 유형의 스키마를 제공합니다,
// 그리고 데이터를 인코딩 및 디코딩하는 함수를 제공합니다.

const NumberFromString = Schema.transform(
  Schema.string,
  Schema.number,
  (string) => parseInt(string),
  (number) => number.toString()
);

// 또는 변환 중 오류를 처리하기 위해 `Schema.transformOrFail`을 사용할 수 있습니다.
// 스키마에는 'E' 유형이 없습니다. 모든 오류는 `ParseError` 유형에 의해 포괄됩니다.

const NumberFromStringSafe = Schema.transformOrFail(
  Schema.string,
  Schema.number,
  (string, _, ast) =>
    ParseResult.try({
      try: () => parseInt(string),
      catch: (error) => ParseResult.type(ast, string),
    }),
  (number) => ParseResult.succeed(number.toString())
);

// 스키마에서 타입을 쉽게 유도할 수 있습니다
type Input = Schema.Schema.To<typeof NumberFromString>;
type Output = Schema.Schema.From<typeof NumberFromString>;

// 이제 이 스키마를 사용하여 데이터를 유효성 검사하고 변환하는 방법을 살펴보겠습니다.

const takesNumber = (n: number) => n;
const takesString = (s: string) => s;
const str = "123";
const n = 132;
declare const unknown: unknown;

// `unknown`이 `A` (숫자)인지 확인하기 위해 `validate`, `assert`, 또는 `is`를 사용할 수 있습니다.
// `is`는 `self is A`를 반환하며 타입 가드에 유용합니다.
if (Schema.is(NumberFromString)(unknown)) {
  takesNumber(unknown);
}
// `assert`는 데이터가 타입 `A`가 아닐 경우 에러를 발생시킵니다.
{
  const assertsNumber: Schema.Schema.ToAsserts<typeof NumberFromString> =
    Schema.asserts(NumberFromString); // 타입스크립트 상의 이유로 필요함
  assertsNumber(unknown);
  takesNumber(unknown);
}

// `validate`는 `Effect<boolean, ParseError, R>`을 반환합니다.

const _ = Effect.gen(function* (_) {
  if (yield* _(Schema.validate(NumberFromString)(unknown))) {
    takesNumber(unknown);
  }
});

// 변환을 위해서는
// `A`에서 `I`로 변환하기 위해 `encode*`를 사용하고
// `I`에서 `A`로 변환하기 위해 `decode*`를 사용합니다.

// 둘 다 `unknown` 버전이 있어서 (`encodeUnknown*` 및 `decodeUnknown*`)
// 먼저 `unknown`이 첫 번째 스키마와 일치하는지 검증한 후에 변환합니다.

// 이 4가지 각각에는 4가지 변형이 있습니다:
// 접미사가 없는 경우 - `Effect<T, ParseError, R>`를 반환합니다.
const one = Schema.encode(NumberFromString)(n);
// `sync` - `T`를 반환하거나 `ParseError`로 예외를 발생시킵니다.
const two = Schema.encodeSync(NumberFromString)(n);
// `promise` - `Promise<T>`를 반환하며, `ParseError`로 거부됩니다.
const three = Schema.encodePromise(NumberFromString)(n);
// `option` - 데이터가 유효하지 않으면 `None`인 `Option<T>`를 반환합니다.
const four = Schema.encodeOption(NumberFromString)(n);
// `either` - 데이터가 유효하지 않으면 `Left`인 `Either<ParseError, T>`를 반환합니다.
const five = Schema.encodeEither(NumberFromString)(n);

// 변환이 비동기적이거나 효과적일 수 있음을 기억하세요,
// `runSync`가 비동기 효과에 대해 오류를 발생시키듯이, 변환이 비동기적인 경우 `encodeSync`가 오류를 발생시킵니다.

// 또 다른 예시
const date = new Date();
const toString = Schema.encodeSync(Schema.DateFromString)(date);
const fromString = Schema.decodeSync(Schema.DateFromString)(toString);
console.log(toString, fromString);

// 단방향 변환에 대해서는 어떻게 할까요?
// 물론 일부 변환은 손실이 발생하고 반전될 수 없습니다.
// 스키마는 `encode`에 편향되어 있습니다 (그래서 `is`/`assert`/`validate` 모두 `A` 타입을 위한 것입니다)

// 단방향 변환이 있는 경우, 디코딩이 항상 실패하도록 만드십시오.

// Schema는 매우 깊고 강력한 라이브러리이며, 우리는 겉핥기만 했습니다.
// 아직 다루지 않은 많은 기능과 유틸리티가 있습니다.
// 일반적인 유형, 패턴 및 필터에 대한 많은 내장 스키마도 있습니다.
// 이 라이브러리는 매우 길고 상세한 readme를 가지고 있으며, 많은 예제와 설명이 포함되어 있습니다.
// 꼭 확인해 보세요: https://github.com/Effect-TS/effect/tree/main/packages/schema

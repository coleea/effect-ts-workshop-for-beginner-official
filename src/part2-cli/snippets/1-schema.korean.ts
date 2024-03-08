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

// 스키마에서

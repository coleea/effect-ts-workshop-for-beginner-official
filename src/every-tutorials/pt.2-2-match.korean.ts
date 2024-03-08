import { Match } from "effect";

// 패턴 매칭은 단일 표현식에서 여러 '케이스'를 처리할 수 있게 하는 강력한 패턴입니다.
// 이는 JavaScript의 switch 문과 유사하지만 더 강력하고 유연합니다.

// 다시 강조하지만, 패턴 매칭은 문장이 아닌 표현식입니다. 이는 값으로 사용될 수 있다는 의미입니다.
// 본질적으로 즉시 실행 함수 내의 switch 문의 개선된 버전입니다

// '매치'의 두 가지 유형이 있지만, 둘 다 기본적으로 같은 것입니다.
// 첫 번째는 어떤 유형을 받아 여러 번 사용할 수 있는 매처를 정의합니다
// 두 번째는 단일 값을 매치하기 위해 사용되는 일회용 매처입니다. (기본적으로 첫 번째이지만 즉시 사용됨)

type Input =
  | { readonly _tag: "A"; readonly a: number }
  | { readonly _tag: "B"; readonly b: boolean }
  | { readonly _tag: "C"; readonly c: number | string };

declare const input: Input;

const match = Match.type<Input>().pipe(
  Match.when({ _tag: "A" }, (a) => `A: ${a.a}`),
  Match.when({ _tag: "B" }, (b) => `B: ${b.b}`)
);

// `Match.when` 메소드로 매치 암을 만들 수 있습니다.
// 값이 패턴과 일치하면 "when" 함수가 값과 함께 호출됩니다.

// 불린 표현식과 유형에 대해서도 매치할 수 있습니다

const match2 = Match.type<Input>().pipe(
  Match.when({ _tag: "A", a: (n) => n > 10 }, (a) => `A > 10: ${a.a}`),
  Match.when({ _tag: "A" }, (a) => `A < 10: ${a.a}`),
  Match.when({ c: Match.string }, (c) => `C는 문자열입니다: ${c.c}`)
);

// 'not'도 가능합니다

const match3 = Match.type<Input>().pipe(
  Match.not({ _tag: "A" }, (bOrC) => `A가 아닙니다: ${bOrC}`)
);

// 태그 매칭을 위한 단축키도 있습니다

const match4 = Match.type<Input>().pipe(
  Match.tag("A", (a) => `A: ${a.a}`),
  Match.tag("B", (b) => `B: ${b.b}`),
  Match.tag("C", (c) => `C: ${c.c}`)
);

// 이 매치를 사용하려고 하면 오류가 발생한다는 점에 유의하세요:
// match(input);

// 모든 매치 암을 정의한 후에는 매치가 발견되지 않았을 때의 동작을 지정하여
// 매치를 '변환'해야 합니다. 여기에는 몇 가지 옵션이 있습니다:

// 첫 번째는 `Match.exhaustive`로 모든 경우가 처리되었음을 타입 레벨에서 보장합니다

const match5 = Match.type<Input>().pipe(
  Match.tag("A", (a) => `A: ${a.a}`),
  Match.tag("B", (b) => `B: ${b.b}`)
  //   Match.exhaustive // 오류
);

const match6 = Match.type<Input>().pipe(
  Match.tag("A", (a) => `A: ${a.a}`),
  Match.tag("B", (b) => `B: ${b.b}`),
  Match.tag("C", (c) => `C: ${c.c}`),
  Match.exhaustive // 확인!
);

const result = match6(input);

// 일부 경우를 처리하지 않고 싶다면 세 가지 옵션이 있습니다

// Match.orElse은 기본값을 제공합니다

const match7 = Match.type<Input>().pipe(
  Match.tag("A", (a) => `A: ${a.a
  }), Match.tag("B", (b) => B: ${b.b}`),
  Match.orElse(() => "매치되지 않음")
);
  
  const result2 = match7(input);
  
  // 매치가 실제로 모두 처리되었지만 이를 타입 레벨에서 단언할 수 없는 경우에는
  // Match.orElseAbsurd를 사용할 수 있으며, 매치가 발견되지 않으면 오류를 던집니다
  
  // Match.option은 매치가 발견되지 않으면 None인 옵션을 제공합니다
  
  const match8 = Match.type<Input>().pipe(
  Match.tag("A", (a) => A: ${a.a}),
  Match.tag("B", (b) => B: ${b.b}),
  Match.option
  );
  
  const result3 = match8(input);
  
  // 마지막으로 Match.either는 option과 유사하지만 매치가 발견되지 않을 때 대신 None 대신 남은 값을 제공합니다
  
  const match9 = Match.type<Input>().pipe(
  Match.tag("A", (a) => A: ${a.a}),
  Match.tag("B", (b) => B: ${b.b}),
  Match.either
  );
  
  const result4 = match9(input);
  
  
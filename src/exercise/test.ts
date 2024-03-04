import { Effect, pipe } from "effect";

// tryOne: Effect<number, UnknownException>
// const tryOne = Effect.try(() => {
//   throw new Error("effect will catch this error");
//   return 0;
// });

console.log(
  Effect.runSync(
    pipe(
      Effect.try(() => {
        throw new Error("effect will catch this error");
        return 0;
      }),
      Effect.catchAll((e) => {
        console.log("캐치올");
        return Effect.succeed(e.message);
      })
    )
  )
);

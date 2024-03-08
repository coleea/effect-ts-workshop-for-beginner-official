import { Effect, Config, Layer, ConfigProvider, pipe } from "effect";

// 구성은 모든 애플리케이션의 중요한 부분입니다
// 하지만 타입 안전성이 떨어지는 경향이 있습니다 (예 : process.env.*)

// Effect의 `Config` 모듈은 타입 안전한 방식으로 구성을 조회하는 방법을 제공합니다
// 완전히 교체 가능한 백엔드도 가지고 있습니다

// 구성 값을 검색하려면 기본 함수 중 하나에 문자열 키를 전달합니다

const PORT = Config.number("PORT");
const HOST = Config.string("HOST");
const LOG_LEVEL = Config.logLevel("LOG_LEVEL");

// 구성들은 `Effect`의 하위 타입이므로 값을 얻으려면 어떤 효과 컨텍스트에서도 사용하세요

const program = Effect.gen(function* (_) {
  const port = yield* _(PORT);
  const host = yield* _(HOST);
  const logLevel = yield* _(LOG_LEVEL);

  console.log(`서버가 ${host}:${port}에서 시작되며 로그 레벨은 ${logLevel}입니다`);
});

// [🚫] 에러 발생시
// 구성 값이 누락되었거나 잘못되었을 경우를 나타내기 위해 `ConfigError`가 나타나는 것을 주목하세요

// Config는 effect에서 사용하는 모든 조합자를 지원합니다

const config = Config.all({
  port: PORT,
  host: HOST,
  logLevel: LOG_LEVEL,
}).pipe(
  Config.map(({ port, host, logLevel }) => ({
    port,
    host,
    logLevel,
    url: `http://${host}:${port}`,
  }))
);

// 다른 유용한 도우미들
const secret = Config.secret("API_KEY");
// 비밀은 콘솔에 출력될 때 은닉될 값입니다

const nested = Config.nested(config, "WEB");
// 이제 `WEB_PORT`, `WEB_HOST`, `WEB_LOG_LEVEL`로 매핑됩니다

// `ConfigProvider` 인터페이스로 완전히 교체 가능한 백엔드가 있습니다
// 기본 백엔드는 단순히 `process.env`에서 읽습니다

// 예를 들어, `Map`에서 제공하는 자신만의 것을 제공할 수 있습니다

const main = pipe(
  program,
  Effect.provide(
    Layer.setConfigProvider(
      ConfigProvider.fromMap(
        new Map([
          ["PORT", "3000"],
          ["HOST", "localhost"],
          ["LOG_LEVEL", "info"],
        ])
      )
    )
  )
);

// 다른 백엔드들

ConfigProvider.fromEnv;
ConfigProvider.fromMap;
ConfigProvider.fromJson;
ConfigProvider.fromFlat;

// 키 '케이스' 스타일 간 변환

ConfigProvider.kebabCase;
ConfigProvider.snakeCase;
ConfigProvider.constantCase;
ConfigProvider.lowerCase;
ConfigProvider.upperCase;

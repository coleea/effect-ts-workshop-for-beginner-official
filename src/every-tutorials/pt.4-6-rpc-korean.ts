import { Resolver, Router, Rpc } from "@effect/rpc";
import * as S from "@effect/schema/Schema";
import { Console, Effect, Layer, Stream } from "effect";
import { HttpRouter, HttpResolver } from "@effect/rpc-http";
import * as HttpServer from "@effect/platform/HttpServer";
import * as HttpClient from "@effect/platform/HttpClient";
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import { createServer } from "node:http";

// RPC 또는 원격 절차 호출은 원격 서버에서 함수를 호출하는 방법입니다.
// 이는 네트워크 통신을 추상화하고 마치 로컬 함수 호출처럼 보이게 합니다.
// 모두 타입 안전성을 유지하면서요.
// effect는 자체 RPC 구현을 제공합니다.

// 이는 클라이언트와 서버가 사용할 스키마를 정의하는 것으로 시작됩니다.
// 요청은 단순한 값이나 스트림을 반환할 수 있습니다.
// 요청은 태그, 오류 스키마, 성공 스키마, 입력들의 형태로 구성됩니다.
// 이 모든 것은 타입 대신 스키마로 정의됩니다. 왜냐하면
// 스키마는 네트워크를 통해 데이터를 직렬화하고 역직렬화하는 데 사용되기 때문입니다.

export class Todo extends S.TaggedClass<Todo>()("Todo", {
  id: S.number.pipe(S.int()),
  title: S.string,
  completed: S.boolean,
}) {}

export class GetTodoError extends S.TaggedError<GetTodoError>()(
  "GetTodoError",
  {}
) {}

export class GetTodos extends Rpc.StreamRequest<GetTodos>()(
  "GetTodos",
  GetTodoError,
  Todo,
  {}
) {}

export class GetTodoById extends S.TaggedRequest<GetTodoById>()(
  "GetTodoById",
  GetTodoError,
  Todo,
  { id: S.number.pipe(S.int()) }
) {}

// Next well create our server

// first we make a router using our schema
const router = Router.make(
  Rpc.stream(GetTodos, () =>
    Stream.fromIterable(
      [1, 2, 3].map((id) => new Todo({ id, title: "todo", completed: false }))
    )
  ),
  Rpc.effect(GetTodoById, ({ id }) =>
    id === 1
      ? Effect.succeed(new Todo({ id, title: "todo", completed: false }))
      : Effect.fail(new GetTodoError({}))
  )
);

export type Router = typeof router;

// you can implement the server in any way you want, but here we'll use the http router

const HttpLive = HttpServer.router.empty.pipe(
  HttpServer.router.post("/rpc", HttpRouter.toHttpApp(router)),
  HttpServer.server.serve(HttpServer.middleware.logger),
  HttpServer.server.withLogAddress,
  Layer.provide(NodeHttpServer.server.layer(createServer, { port: 3000 }))
);

Layer.launch(HttpLive).pipe(NodeRuntime.runMain);

// and finally we can create a client, again this can be done in any way you want
// but here we'll use the http client

const client = HttpResolver.make<Router>(
  HttpClient.client
    .fetchOk()
    .pipe(
      HttpClient.client.mapRequest(
        HttpClient.request.prependUrl("http://localhost:3000/rpc")
      )
    )
).pipe(Resolver.toClient);

// and now we can use the client with our rpc requests

client(new GetTodos()).pipe(
  Stream.runCollect,
  Effect.flatMap(
    Effect.forEach(({ id }) => client(new GetTodoById({ id })), {
      batching: true,
    })
  ),
  Effect.tap(Console.log),
  Effect.runFork
);

# Effect Beginner/Intermediate Workshop By Ethan Niser

Follow me on [Twitter](https://twitter.com/ethanniser) and [YouTube](https://www.youtube.com/@ethanniser)

## USEFUL LINKS

- [Effect API Docs](https://effect-ts.github.io/effect/)
- [Effect Docs](https://effect.website/)
- [Effect Official Repository](https://github.com/Effect-TS/effect)
- [Effect Discord](https://discord.gg/effect-ts)


## Videos 
- [Effect Official Youtube Channel](https://www.youtube.com/@effect-ts/videos)
- [Introduction to Effect by Michael Arnaldi in Worker Conf](https://www.youtube.com/watch?v=zrNr3JVUc8I)
- [Michael Arnaldi introduce Effect-ts in TypeScript Berlin Meetup](https://www.youtube.com/watch?v=Oy7fr2_WBFI)
- [WHY EFFECT? BY MICHAEL ARNALDI in Effect Meetup (SAN FRANCISCO)](https://www.youtube.com/watch?v=BqUnsDnMnMo)
- [Functional Effect Systems To The Rescue by Michael Arnaldi](https://www.youtube.com/watch?v=Ol1VTFt2FTQ)
- [Lambda Lounge Jan - Effect TS by Michael Arnaldi](https://www.youtube.com/watch?v=LhCPPrxUUNM)
- [Michael Arnaldi interview with Ihar Abukhouski ](https://www.youtube.com/watch?v=7EblTlnqRLM)
- [ZIO as a Language by Michael Arnaldi ](https://www.youtube.com/watch?v=6plVvxZ2rsM)
- [Effect: Next-Generation Typescript by Ethan Niser](https://www.youtube.com/watch?v=SloZE4i4Zfk)
- [Effect for Beginners by Ethan Niser](https://www.youtube.com/watch?v=fTN8BX5qj6s)

## Podcasts
- [Happy Path Programming - TypeScript & Effects with Michael Arnaldi](https://podcasters.spotify.com/pod/show/happypathprogramming/episodes/81-TypeScript--Effects-with-Michael-Arnaldi-e26d91o)
- [The Developers' Bakery - Effect with Michael Arnaldi](https://thebakery.dev/67/)



## Reading Material
- [ybogomolov.me : Intro To Effect, Part 5: Software Transactional Memory in Effect](https://ybogomolov.me/05-effect-stm)
- [ybogomolov.me : Intro To Effect, Part 4: Concurrency in Effect](https://ybogomolov.me/04-effect-concurrency)
- [ybogomolov.me : Intro To Effect, Part 3: Managing Dependencies](https://ybogomolov.me/03-effect-managing-dependencies)
- [ybogomolov.me : Intro To Effect, Part 2: Handling Errors](https://ybogomolov.me/02-effect-handling-errors)
- [ybogomolov.me : Intro To Effect, Part 1: What Is Effect?](https://ybogomolov.me/01-effect-intro)





## REQUIREMENTS:

### A way to run typescript Node (with ts-node or tsx) or Bun

https://nodejs.org/en

```bash
npm i -g tsx
```

I'm using bun just because its over twice as fast to run typescript than with `tsx` or `ts-node`
If you want to also use bun you can install it at https://bun.sh/docs/installation

### Install JS Dependecies

```bash
npm i
yarn i
pnpm i
bun i
```

### An editor that supports LSP

Hovering to see types, autocompletion, and go-to-definition are gonna be pretty useful. I'll be using VSCode, but you can use any editor that supports LSP.

## How this project is broken up

### Slides

The slides are available online at [https://effect-workshop-slides.vercel.app](https://effect-workshop-slides.vercel.app)
But, if you wish to run the slides locally:

```bash
cd slides
bun run dev
```

### **All of the content is in the `src` folder**

Each part has its own folder. Within those folders you find these folders:

#### `snippets`

This contains typescript files that have code examples and comment explanations for individual concepts. I will go through these files in the workshop. Free free to follow along and read the comments.

#### `exercises`

This contains typescript files that define some practice exercises for individual concepts. They define test cases that you can check by just running the file.

_Solutions are located in the `solutions` folder_

#### `project`

For parts 2 and 3, we will be rewriting a non-effect application to effect. The project folder contains the non-effect application, and is where if you want to follow along, you can modify the code to use effect.

##### `AFTER_THE_WORKSHOP.md`

To reinforce your learning, I've provided some ideas for how to expand each project when you get home. Try them out on your own, and if you need help feel free to @ me in the Effect discord- I'd love to see how people approach each problem.

#### `breakpoints`

For parts 2 & 3, 'breakpoints' defines each of the steps we will take to refactor the non-effect application to effect. Each file is a folder. All changes between steps are described in the `changes.md` file.

If you get lost, you can always copy whatever 'breakpoint' you are on to the `project` folder and continue from there.

### `pad.ts`

Stands for 'scratchpad'. Pretty useful for just trying out some code that doesn't necessarily belong anywhere.

```bash
bun run pad
```

## Running Files

Every file is prefixed with a number. I have defined a bun of scripts so you don't have to type out the whole file name / path.

They follow this pattern:

```
part = 1 | 2 | 3 | 4
section = s (snippets) | e (exercises) | p (project) | b (breakpoints)
fileOrFolderNumber = (if folder will run index.ts)

bun run part-section-fileOrFolderNumber
```

For example, to run the first snippet in part 1:

```bash
bun run 1-s-1
```

To run the first exercise in part 2:

```bash
bun run 2-e-1
```

To run the part 3 project:

```bash
bun run 3-p
```

## Cheat Sheet

For quick reference or for review feel free to read [CHEATSHEET.md](./CHEATSHEET.md)

## VSCode Snippets

```json
{
  "Gen Function $": {
    "prefix": "gg",
    "body": ["function* (_) {\n\t$0\n}"],
    "description": "Generator function with _ input"
  },
  "Gen Function $ (wrapped)": {
    "prefix": "egg",
    "body": ["Effect.gen(function* (_) {\n\t$0\n})"],
    "description": "Generator function with _ input"
  },
  "Gen Yield $": {
    "prefix": "yy",
    "body": ["yield* _($0)"],
    "description": "Yield generator calling _()"
  },
  "Gen Yield $ (const)": {
    "prefix": "cyy",
    "body": ["const $1 = yield* _($0)"],
    "description": "Yield generator calling _()"
  }
}
```

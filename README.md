# 通过接口方式调用 npm api。获取 npm 包的下载数量

### USAGE

1. `npm install && npx tsx ./index.ts`

   运行该命令会启动一个 prompts 提示器，按照提示下一步即可

2. `npm install && npx tsx ./index.tx --mode='' --period='' --packages=''`

   也可以在命令行内指定参数。两种命令任选其一

   a. `--period`

   - last-day
   - last-week
   - last-month
   - last-year
   - custom; 格式为: **YYYY-MM-DD:YYYY-MM-DD**

   b. `--mode`

   - point
   - range

   c. `--packages`

   - 多个时使用 `,` 分隔

### 总数统计

`https://api.npmjs.org/downloads/point/{period}[/{packages}]`

### 按天统计

`https://api.npmjs.org/downloads/range/{period}[/{packages}]`

---

#### `period`

**时间范围，枚举如下**

- `last-day`(一般是昨天)
- `last-week`
- `last-month`
- `last-year`
- `start-date:end-date`, `YYYY-MM-DD:YYYY-MM-DD`
  - eg: 2024-05-20:2024-06-20

#### `packages`

**包名，支持多个**

- eg: vue
- 多个 eg: vue,react

[附文档: package download counts link](https://github.com/npm/registry/blob/main/docs/download-counts.md)

---

## USAGE with tsx

`npm install tsx --save && npx tsx index.ts`

### [what is tsx?](https://tsx.is/getting-started)

`node index.js` => `tsx index.js` or `tsx index.ts`

相比 `node` 命令来说 `tsx` 可以运行 `ts` 文件

可以替代 `node` 来运行 `js/ts` 文件。主要是用来抹平 `esm cjs` 差异。
可以在 基于 `cjs` 的文件中使用 `esm` 的包，也可以在基于 `esm` 的文件中 `cjs` 的包

举个例子:
在 `ts` 文件内部使用 `esm` 模块

```typescript
// packageA => cjs
// packageB => esm

// in index.ts
import * as packageA from "./packageA";
import * as packageB from "./packageB";

console.log(packageA, packageB);
// 上述代码可以正常运行
```

同样的 在 ts 文件内部使用 cjs 模块

```typescript
// packageA => cjs
// packageB => esm

// in index.ts
const utilsB = require("./utilsB");
const utilsA = require("./utilsA");

console.log(packageA, packageB);
// 上述代码可以正常运行
```

### 最主要特性是无需下载 typescript 包并转译成 js，即可运行 ts 文件

`npx tsx index.ts`

持续监听某文件
所有在`index.ts` 导入的文件都会受到监听，但是可以通过`--ignore`参数忽略一些不需要监听的文件

`tsx watch --ignore ./ignore-me.js --ignore ./ignore-me-too.js ./index.ts`

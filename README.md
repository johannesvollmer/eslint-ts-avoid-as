# eslint-ts-avoid-as

[![npm version](https://badge.fury.io/js/eslint-ts-avoid-as.svg)](https://www.npmjs.com/package/eslint-ts-avoid-as)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

> An ESLint plugin that helps you write safer TypeScript code by discouraging the use of `as` type assertions on literal values.

## 🎯 What does it do?

This ESLint rule identifies cases where you're using TypeScript's `as` type assertion on literal values (objects, arrays, strings, numbers, etc.) and suggests using the safer `satisfies` operator instead.

### Why use `satisfies` instead of `as`?

The `satisfies` operator (introduced in TypeScript 4.9) is safer than `as` because:

- ✅ **Type checking**: `satisfies` validates that your value actually matches the type, catching errors at compile time
- ✅ **Inference preservation**: Your value keeps its specific inferred type (e.g., `"red"` stays as `"red"` instead of being widened to `string`)
- ❌ **Type assertions with `as`**: Can force incompatible types, potentially hiding bugs

### Example

**❌ Bad (using `as`):**
```typescript
interface Config {
  name: string;
  value: number;
}

// This compiles but loses type information
const config = { name: "test", value: 42 } as Config;

// Dangerous: TypeScript won't catch this error!
const broken = { name: "test", wrongProp: true } as Config;
```

**✅ Good (using `satisfies`):**
```typescript
interface Config {
  name: string;
  value: number;
}

// This validates the type AND preserves inference
const config = { name: "test", value: 42 } satisfies Config;

// TypeScript catches this error at compile time! 🎉
const broken = { name: "test", wrongProp: true } satisfies Config;
//    ^^^^^^ Error: Object literal may only specify known properties
```

## 📦 Installation

```bash
npm install --save-dev eslint-ts-avoid-as
```

**Peer Dependencies:**
- `eslint` >= 8.0.0
- `@typescript-eslint/parser` >= 8.0.0
- `typescript` >= 5.0.0

## 🚀 Usage

### 1. Configure ESLint

Add the plugin to your ESLint configuration:

**Using ESM (eslint.config.js):**
```javascript
import tsAvoidAs from 'eslint-ts-avoid-as';

export default [
  {
    plugins: {
      'ts-avoid-as': tsAvoidAs,
    },
    rules: {
      'ts-avoid-as/avoid-as': 'error',
    },
  },
];
```

**Using CommonJS (.eslintrc.js):**
```javascript
module.exports = {
  plugins: ['ts-avoid-as'],
  rules: {
    'ts-avoid-as/avoid-as': 'error',
  },
};
```

**Using JSON (.eslintrc.json):**
```json
{
  "plugins": ["ts-avoid-as"],
  "rules": {
    "ts-avoid-as/avoid-as": "error"
  }
}
```

### 2. Configure TypeScript Parser

This plugin requires type information, so make sure your ESLint config uses `@typescript-eslint/parser`:

```javascript
export default [
  {
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
      'ts-avoid-as': tsAvoidAs,
    },
    rules: {
      'ts-avoid-as/avoid-as': 'error',
    },
  },
];
```

## 📋 Rule Details

This rule reports two types of issues:

### 1. Unnecessary `as` with compatible types

When you use `as` on a literal value with a compatible type, the rule suggests using `satisfies` instead and provides an automatic fix.

**Examples of incorrect code:**

```typescript
// ❌ Object literals
const obj = { x: 1, y: 2 } as Point;

// ❌ Array literals
const arr = [1, 2, 3] as number[];

// ❌ String literals
const str = "hello" as string;

// ❌ Number literals
const num = 42 as number;

// ❌ Boolean literals
const flag = true as boolean;
```

**Examples of correct code:**

```typescript
// ✅ Using satisfies
const obj = { x: 1, y: 2 } satisfies Point;
const arr = [1, 2, 3] satisfies number[];

// ✅ Using as const (allowed)
const obj = { x: 1, y: 2 } as const;
const arr = [1, 2, 3] as const;

// ✅ Using as with non-literals (allowed)
const value = getValue() as number;
const result = someVariable as SomeType;
```

### 2. Incompatible type assertions

When you try to assert a literal value to an incompatible type, the rule reports an error without providing a fix (because the code is likely incorrect).

**Examples of incorrect code:**

```typescript
// ❌ Type mismatch
const num = "hello" as number;  // Error: Type 'string' is not assignable to type 'number'

// ❌ Wrong union member
type Status = "active" | "inactive";
const status = "pending" as Status;  // Error: Type '"pending"' is not assignable to type 'Status'

// ❌ Missing required properties
interface User { name: string; age: number; }
const user = { name: "John" } as User;  // Error: Property 'age' is missing
```

## 🔧 Options

This rule currently has no configuration options.

## 🤝 When NOT to use this rule

You might want to disable this rule if:

- You're working with legacy TypeScript code (< 4.9) that doesn't support `satisfies`
- You're intentionally using `as` for type assertions on literals (though we'd recommend reconsidering this)
- You're using `as const` exclusively (which is allowed by this rule)

## 🐛 Compatibility

- **TypeScript**: >= 5.0.0 (requires `satisfies` operator support from TS 4.9+)
- **ESLint**: >= 8.0.0
- **Node.js**: >= 18.0.0

## 💡 Examples

### Before (using `as`):
```typescript
interface Config {
  theme: "light" | "dark";
  fontSize: number;
}

const config = {
  theme: "light",
  fontSize: 14
} as Config;

// Type of config.theme is "light" | "dark" (widened)
// Can't access the specific literal type
```

### After (using `satisfies`):
```typescript
interface Config {
  theme: "light" | "dark";
  fontSize: number;
}

const config = {
  theme: "light",
  fontSize: 14
} satisfies Config;

// Type of config.theme is "light" (preserved!)
// Can use this specific type in conditional logic
```

## 📝 License

ISC © [Johannes Vollmer](https://github.com/johannesvollmer)

## 🙏 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 💖 Support

If you find this plugin helpful, please consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting new features
- 💰 [Sponsoring the author](https://github.com/sponsors/johannesvollmer)

## 🔗 Links

- [npm package](https://www.npmjs.com/package/eslint-ts-avoid-as)
- [GitHub repository](https://github.com/johannesvollmer/eslint-ts-avoid-as)
- [Issue tracker](https://github.com/johannesvollmer/eslint-ts-avoid-as/issues)
- [TypeScript `satisfies` documentation](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator)

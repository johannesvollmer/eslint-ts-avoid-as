import path from 'path';
import { RuleTester } from '@typescript-eslint/rule-tester';
import parser from '@typescript-eslint/parser';
import rule from './avoid-as';

// Configure RuleTester afterAll for Jest compatibility
RuleTester.afterAll = afterAll;

const ruleTester = new RuleTester({
  languageOptions: {
    parser: parser as any,
    parserOptions: {
      projectService: {
        allowDefaultProject: ['*.ts*'],
        maximumDefaultProjectFileMatchCount_THIS_WILL_SLOW_DOWN_LINTING: 100,
      },
      tsconfigRootDir: path.join(__dirname, '../..'),
    },
  },
} as any);

describe('avoid-as', () => {
  ruleTester.run('ts-avoid-as', rule, {
    valid: [
      {
        filename: 'using-satisfies-with-object-literal.ts',
        code: `
          interface Config {
            name: string;
            value: number;
          }
          const config = { name: "test", value: 42 } satisfies Config;
        `,
      },
      {
        filename: 'using-satisfies-with-array-literal.ts',
        code: `
          const arr = [1, 2, 3] satisfies number[];
        `,
      },
      {
        filename: 'using-satisfies-with-string-literal.ts',
        code: `
          const str = "hello" satisfies string;
        `,
      },
      {
        filename: 'as-with-function-call.ts',
        code: `
          const num = getValue() as number;
        `,
      },
      {
        filename: 'as-with-variable.ts',
        code: `
          const value = someVariable as SomeType;
        `,
      },
      {
        filename: 'no-type-assertion.ts',
        code: `
          const obj = { name: "test", value: 42 };
        `,
      },
      {
        filename: 'as-const-with-object.ts',
        code: `
          const config = { name: "test", value: 42 } as const;
        `,
      },
      {
        filename: 'as-const-with-array.ts',
        code: `
          const arr = [1, 2, 3] as const;
        `,
      },
      {
        filename: 'as-const-with-tuple.ts',
        code: `
          const tuple = ["hello", 42, true] as const;
        `,
      },
      {
        filename: 'as-any-with-function-call.ts',
        code: `
          const data = fetchData() as any;
        `,
      },
      {
        filename: 'as-unknown-with-variable.ts',
        code: `
          const result = someValue as unknown;
        `,
      },
      {
        filename: 'as-with-nullable-variable.ts',
        code: `
          const value = maybeValue as string | null;
        `,
      },
      {
        filename: 'as-with-optional-variable.ts',
        code: `
          const item = getItem() as undefined | number;
        `,
      },
      {
        filename: 'as-with-template-literal.ts',
        code: `
          const id = \`user-\${userId}\` as string;
        `,
      },
      {
        filename: 'as-with-function-expression.ts',
        code: `
          const fn = function() { return 42; } as () => number;
        `,
      },
      {
        filename: 'as-with-arrow-function.ts',
        code: `
          const arrow = (() => 42) as () => number;
        `,
      },
      {
        filename: 'as-with-class-instance.ts',
        code: `
          class MyClass {}
          const instance = new MyClass() as MyClass;
        `,
      },
      {
        filename: 'as-with-conditional-expression.ts',
        code: `
          const value = (condition ? "yes" : "no") as string;
        `,
      },
      {
        filename: 'as-with-typeof-expression.ts',
        code: `
          const t = typeof value as "string" | "number";
        `,
      },
    ],
    invalid: [
      {
        filename: 'as-with-object-literal-compatible.ts',
        code: `
          interface Config {
            name: string;
            value: number;
          }
          const config = { name: "test", value: 42 } as Config;
        `,
        output: `
          interface Config {
            name: string;
            value: number;
          }
          const config = { name: "test", value: 42 } satisfies Config;
        `,
        errors: [
          {
            messageId: 'avoidAsWithLiteral',
          },
        ],
      },
      {
        filename: 'as-with-empty-object.ts',
        code: `
          const obj = {} as Record<string, any>;
        `,
        output: `
          const obj = {} satisfies Record<string, any>;
        `,
        errors: [
          {
            messageId: 'avoidAsWithLiteral',
          },
        ],
      },
      {
        filename: 'as-with-nested-object.ts',
        code: `
          type User = {
            name: string;
            address: {
              city: string;
              zip: string;
            };
          };
          const user = {
            name: "John",
            address: {
              city: "NYC",
              zip: "10001"
            }
          } as User;
        `,
        output: `
          type User = {
            name: string;
            address: {
              city: string;
              zip: string;
            };
          };
          const user = {
            name: "John",
            address: {
              city: "NYC",
              zip: "10001"
            }
          } satisfies User;
        `,
        errors: [
          {
            messageId: 'avoidAsWithLiteral',
          },
        ],
      },
      {
        filename: 'as-with-array-literal.ts',
        code: `
          const arr = [1, 2, 3] as number[];
        `,
        output: `
          const arr = [1, 2, 3] satisfies number[];
        `,
        errors: [
          {
            messageId: 'avoidAsWithLiteral',
          },
        ],
      },
      {
        filename: 'as-with-string-literal.ts',
        code: `
          const str = "hello" as string;
        `,
        output: `
          const str = "hello" satisfies string;
        `,
        errors: [
          {
            messageId: 'avoidAsWithLiteral',
          },
        ],
      },
      {
        filename: 'as-with-number-literal.ts',
        code: `
          const num = 42 as number;
        `,
        output: `
          const num = 42 satisfies number;
        `,
        errors: [
          {
            messageId: 'avoidAsWithLiteral',
          },
        ],
      },
      {
        filename: 'as-with-boolean-literal.ts',
        code: `
          const flag = true as boolean;
        `,
        output: `
          const flag = true satisfies boolean;
        `,
        errors: [
          {
            messageId: 'avoidAsWithLiteral',
          },
        ],
      },
      {
        filename: 'as-with-null-literal.ts',
        code: `
          const val = null as null;
        `,
        output: `
          const val = null satisfies null;
        `,
        errors: [
          {
            messageId: 'avoidAsWithLiteral',
          },
        ],
      },
      {
        filename: 'as-with-bigint-literal.ts',
        code: `
          const big = 100n as bigint;
        `,
        output: `
          const big = 100n satisfies bigint;
        `,
        errors: [
          {
            messageId: 'avoidAsWithLiteral',
          },
        ],
      },
      {
        filename: 'as-with-readonly-array.ts',
        code: `
          const arr = [1, 2, 3] as readonly number[];
        `,
        output: `
          const arr = [1, 2, 3] satisfies readonly number[];
        `,
        errors: [
          {
            messageId: 'avoidAsWithLiteral',
          },
        ],
      },
      {
        filename: 'as-with-tuple-type.ts',
        code: `
          const tuple = ["hello", 42] as [string, number];
        `,
        output: `
          const tuple = ["hello", 42] satisfies [string, number];
        `,
        errors: [
          {
            messageId: 'avoidAsWithLiteral',
          },
        ],
      },
      {
        filename: 'as-with-union-type.ts',
        code: `
          const val = "hello" as string | number;
        `,
        output: `
          const val = "hello" satisfies string | number;
        `,
        errors: [
          {
            messageId: 'avoidAsWithLiteral',
          },
        ],
      },
      {
        filename: 'as-with-nested-arrays.ts',
        code: `
          const matrix = [[1, 2], [3, 4]] as number[][];
        `,
        output: `
          const matrix = [[1, 2], [3, 4]] satisfies number[][];
        `,
        errors: [
          {
            messageId: 'avoidAsWithLiteral',
          },
        ],
      },
      {
        filename: 'as-with-object-containing-methods.ts',
        code: `
          interface Calculator {
            add: (a: number, b: number) => number;
          }
          const calc = { add: (a: number, b: number) => a + b } as Calculator;
        `,
        output: `
          interface Calculator {
            add: (a: number, b: number) => number;
          }
          const calc = { add: (a: number, b: number) => a + b } satisfies Calculator;
        `,
        errors: [
          {
            messageId: 'avoidAsWithLiteral',
          },
        ],
      },
      {
        filename: 'as-with-empty-array.ts',
        code: `
          const arr = [] as string[];
        `,
        output: `
          const arr = [] satisfies string[];
        `,
        errors: [
          {
            messageId: 'avoidAsWithLiteral',
          },
        ],
      },
      {
        filename: 'as-with-specific-string-literal-type.ts',
        code: `
          type Color = "red" | "green" | "blue";
          const color = "red" as Color;
        `,
        output: `
          type Color = "red" | "green" | "blue";
          const color = "red" satisfies Color;
        `,
        errors: [
          {
            messageId: 'avoidAsWithLiteral',
          },
        ],
      },
      {
        filename: 'as-with-specific-number-literal-type.ts',
        code: `
          type Version = 1 | 2 | 3;
          const version = 2 as Version;
        `,
        output: `
          type Version = 1 | 2 | 3;
          const version = 2 satisfies Version;
        `,
        errors: [
          {
            messageId: 'avoidAsWithLiteral',
          },
        ],
      },
      {
        filename: 'as-with-intersection-type.ts',
        code: `
          type HasName = { name: string };
          type HasAge = { age: number };
          const person = { name: "John", age: 30 } as HasName & HasAge;
        `,
        output: `
          type HasName = { name: string };
          type HasAge = { age: number };
          const person = { name: "John", age: 30 } satisfies HasName & HasAge;
        `,
        errors: [
          {
            messageId: 'avoidAsWithLiteral',
          },
        ],
      },
      {
        filename: 'as-with-optional-properties.ts',
        code: `
          interface User {
            name: string;
            email?: string;
          }
          const user = { name: "Alice" } as User;
        `,
        output: `
          interface User {
            name: string;
            email?: string;
          }
          const user = { name: "Alice" } satisfies User;
        `,
        errors: [
          {
            messageId: 'avoidAsWithLiteral',
          },
        ],
      },
      {
        filename: 'as-with-index-signature.ts',
        code: `
          const dict = { key1: "value1", key2: "value2" } as { [key: string]: string };
        `,
        output: `
          const dict = { key1: "value1", key2: "value2" } satisfies { [key: string]: string };
        `,
        errors: [
          {
            messageId: 'avoidAsWithLiteral',
          },
        ],
      },
      {
        filename: 'string-literal-as-boolean-incompatible.ts',
        code: `
          const val = "hi" as boolean;
        `,
        errors: [
          {
            messageId: 'incompatibleTypeAssertion',
            data: {
              sourceType: '"hi"',
              targetType: 'boolean',
            },
          },
        ],
      },
      {
        filename: 'number-literal-as-string-incompatible.ts',
        code: `
          const val = 42 as string;
        `,
        errors: [
          {
            messageId: 'incompatibleTypeAssertion',
            data: {
              sourceType: '42',
              targetType: 'string',
            },
          },
        ],
      },
      {
        filename: 'boolean-literal-as-number-incompatible.ts',
        code: `
          const val = true as number;
        `,
        errors: [
          {
            messageId: 'incompatibleTypeAssertion',
            data: {
              sourceType: 'true',
              targetType: 'number',
            },
          },
        ],
      },
      {
        filename: 'array-literal-as-object-incompatible.ts',
        code: `
          interface User {
            name: string;
            age: number;
          }
          const val = [1, 2, 3] as User;
        `,
        errors: [
          {
            messageId: 'incompatibleTypeAssertion',
            data: {
              sourceType: 'number[]',
              targetType: 'User',
            },
          },
        ],
      },
      {
        filename: 'object-literal-with-wrong-structure.ts',
        code: `
          interface Config {
            name: string;
            value: number;
          }
          const val = { name: "test", wrongProp: true } as Config;
        `,
        errors: [
          {
            messageId: 'incompatibleTypeAssertion',
          },
        ],
      },
      {
        filename: 'string-literal-wrong-union-member.ts',
        code: `
          type Status = "active" | "inactive";
          const val = "pending" as Status;
        `,
        errors: [
          {
            messageId: 'incompatibleTypeAssertion',
            data: {
              sourceType: '"pending"',
              targetType: 'Status',
            },
          },
        ],
      },
      {
        filename: 'number-literal-wrong-union-member.ts',
        code: `
          type Port = 80 | 443 | 8080;
          const val = 3000 as Port;
        `,
        errors: [
          {
            messageId: 'incompatibleTypeAssertion',
            data: {
              sourceType: '3000',
              targetType: 'Port',
            },
          },
        ],
      },
      {
        filename: 'null-as-non-nullable-object.ts',
        code: `
          interface User {
            name: string;
          }
          const val = null as User;
        `,
        errors: [
          {
            messageId: 'incompatibleTypeAssertion',
            data: {
              sourceType: 'null',
              targetType: 'User',
            },
          },
        ],
      },
      {
        filename: 'object-literal-as-primitive.ts',
        code: `
          const val = { x: 1 } as number;
        `,
        errors: [
          {
            messageId: 'incompatibleTypeAssertion',
          },
        ],
      },
      {
        filename: 'array-as-string.ts',
        code: `
          const val = [1, 2, 3] as string;
        `,
        errors: [
          {
            messageId: 'incompatibleTypeAssertion',
            data: {
              sourceType: 'number[]',
              targetType: 'string',
            },
          },
        ],
      },
      {
        filename: 'empty-object-as-interface-with-required-properties.ts',
        code: `
          interface Required {
            id: number;
            name: string;
          }
          const val = {} as Required;
        `,
        output: `
          interface Required {
            id: number;
            name: string;
          }
          const val = {} satisfies Required;
        `,
        errors: [
          {
            messageId: 'avoidAsWithLiteral',
          },
        ],
      },
      {
        filename: 'wrong-tuple-length.ts',
        code: `
          const val = [1, 2, 3] as [number, number];
        `,
        errors: [
          {
            messageId: 'incompatibleTypeAssertion',
          },
        ],
      },
      {
        filename: 'wrong-tuple-element-types.ts',
        code: `
          const val = ["hello", "world"] as [string, number];
        `,
        errors: [
          {
            messageId: 'incompatibleTypeAssertion',
          },
        ],
      },
      {
        filename: 'incompatible-union-types.ts',
        code: `
          type A = "a" | "b";
          type B = "c" | "d";
          const val = "a" as B;
        `,
        errors: [
          {
            messageId: 'incompatibleTypeAssertion',
            data: {
              sourceType: '"a"',
              targetType: 'B',
            },
          },
        ],
      },
      {
        filename: 'incompatible-interfaces.ts',
        code: `
          interface A {
            propA: string;
          }
          interface B {
            propB: number;
          }
          const val = { propA: "test" } as B;
        `,
        errors: [
          {
            messageId: 'incompatibleTypeAssertion',
          },
        ],
      },
      {
        filename: 'number-as-boolean.ts',
        code: `
          const val = 1 as boolean;
        `,
        errors: [
          {
            messageId: 'incompatibleTypeAssertion',
            data: {
              sourceType: '1',
              targetType: 'boolean',
            },
          },
        ],
      },
      {
        filename: 'boolean-as-string.ts',
        code: `
          const val = false as string;
        `,
        errors: [
          {
            messageId: 'incompatibleTypeAssertion',
            data: {
              sourceType: 'false',
              targetType: 'string',
            },
          },
        ],
      },
      {
        filename: 'string-as-number-array.ts',
        code: `
          const val = "hello" as number[];
        `,
        errors: [
          {
            messageId: 'incompatibleTypeAssertion',
            data: {
              sourceType: '"hello"',
              targetType: 'number[]',
            },
          },
        ],
      },
    ],
  });
});

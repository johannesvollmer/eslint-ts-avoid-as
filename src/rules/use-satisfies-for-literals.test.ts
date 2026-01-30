import path from 'path';
import { RuleTester } from '@typescript-eslint/rule-tester';
import parser from '@typescript-eslint/parser';
import rule from './use-satisfies-for-literals';

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

describe('use-satisfies-for-literals', () => {
  ruleTester.run('use-satisfies-for-literals', rule, {
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
      // Incompatible types should not be reported by this rule
      {
        filename: 'string-literal-as-boolean-incompatible.ts',
        code: `
          const val = "hi" as boolean;
        `,
      },
      {
        filename: 'number-literal-as-string-incompatible.ts',
        code: `
          const val = 42 as string;
        `,
      },
      // Test files should be allowed to use 'as' for mocking
      {
        filename: 'component.test.ts',
        code: `
          interface User {
            name: string;
            age: number;
          }
          const mockUser = { name: "Test User", age: 25 } as User;
        `,
      },
      {
        filename: 'utils.test.tsx',
        code: `
          const mockData = [1, 2, 3] as number[];
        `,
      },
      {
        filename: 'integration.test.ts',
        code: `
          const config = { key: "value" } as Record<string, any>;
        `,
      },
      {
        filename: 'my-feature.test.ts',
        code: `
          const testString = "hello" as string;
        `,
      },
      {
        filename: 'my-component.spec.ts',
        code: `
          interface Props {
            title: string;
          }
          const mockProps = { title: "Test" } as Props;
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
            messageId: 'useSatisfiesForLiterals',
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
            messageId: 'useSatisfiesForLiterals',
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
            messageId: 'useSatisfiesForLiterals',
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
            messageId: 'useSatisfiesForLiterals',
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
            messageId: 'useSatisfiesForLiterals',
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
            messageId: 'useSatisfiesForLiterals',
            column: 23,
            endColumn: 42,
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
            messageId: 'useSatisfiesForLiterals',
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
            messageId: 'useSatisfiesForLiterals',
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
            messageId: 'useSatisfiesForLiterals',
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
            messageId: 'useSatisfiesForLiterals',
            column: 25,
            endColumn: 65,
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
            messageId: 'useSatisfiesForLiterals',
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
            messageId: 'useSatisfiesForLiterals',
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
            messageId: 'useSatisfiesForLiterals',
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
            messageId: 'useSatisfiesForLiterals',
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
            messageId: 'useSatisfiesForLiterals',
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
            messageId: 'useSatisfiesForLiterals',
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
            messageId: 'useSatisfiesForLiterals',
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
            messageId: 'useSatisfiesForLiterals',
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
            messageId: 'useSatisfiesForLiterals',
          },
        ],
      },
    ],
  });
});

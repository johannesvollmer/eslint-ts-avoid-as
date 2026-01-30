import path from 'path';
import { RuleTester } from '@typescript-eslint/rule-tester';
import parser from '@typescript-eslint/parser';
import rule from './literal-type-mismatch';

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

describe('literal-type-mismatch', () => {
  ruleTester.run('literal-type-mismatch', rule, {
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
      // Compatible types should not be reported by this rule
      {
        filename: 'as-with-object-literal-compatible.ts',
        code: `
          interface Config {
            name: string;
            value: number;
          }
          const config = { name: "test", value: 42 } as Config;
        `,
      },
      {
        filename: 'as-with-array-literal.ts',
        code: `
          const arr = [1, 2, 3] as number[];
        `,
      },
      {
        filename: 'as-with-string-literal.ts',
        code: `
          const str = "hello" as string;
        `,
      },
      {
        filename: 'as-with-number-literal.ts',
        code: `
          const num = 42 as number;
        `,
      },
      {
        filename: 'as-with-boolean-literal.ts',
        code: `
          const flag = true as boolean;
        `,
      },
      {
        filename: 'object-with-all-required-properties-present.ts',
        code: `
          interface Config {
            name: string;
            value: number;
          }
          const config = { name: "test", value: 42 } as Config;
        `,
      },
      {
        filename: 'object-with-optional-property-missing.ts',
        code: `
          interface User {
            id: number;
            name: string;
            email?: string;
          }
          const user = { id: 1, name: "Alice" } as User;
        `,
      },
      // Test files should be allowed to use 'as' for mocking, even with type mismatches
      {
        filename: 'component.test.ts',
        code: `
          const val = "hi" as boolean;
        `,
      },
      {
        filename: 'utils.test.tsx',
        code: `
          interface User {
            name: string;
            age: number;
          }
          const mockUser = { name: "Test" } as User; // missing 'age' property
        `,
      },
      {
        filename: 'integration.test.ts',
        code: `
          type Status = "active" | "inactive";
          const mockStatus = "pending" as Status; // wrong union member
        `,
      },
      {
        filename: 'feature.test.ts',
        code: `
          const val = 42 as string; // incompatible type
        `,
      },
      {
        filename: 'component.spec.tsx',
        code: `
          interface Config {
            enabled: boolean;
          }
          const mockConfig = {} as Config; // missing required property
        `,
      },
    ],
    invalid: [
      {
        filename: 'string-literal-as-boolean-incompatible.ts',
        code: `
          const val = "hi" as boolean;
        `,
        errors: [
          {
            messageId: 'literalTypeMismatch',
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
            messageId: 'literalTypeMismatch',
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
            messageId: 'literalTypeMismatch',
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
            messageId: 'literalTypeMismatch',
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
            messageId: 'literalTypeMismatch',
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
            messageId: 'literalTypeMismatch',
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
            messageId: 'literalTypeMismatch',
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
            messageId: 'literalTypeMismatch',
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
            messageId: 'literalTypeMismatch',
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
            messageId: 'literalTypeMismatch',
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
            messageId: 'literalTypeMismatch',
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
            messageId: 'literalTypeMismatch',
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
            messageId: 'literalTypeMismatch',
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
            messageId: 'literalTypeMismatch',
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
            messageId: 'literalTypeMismatch',
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
            messageId: 'literalTypeMismatch',
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
            messageId: 'literalTypeMismatch',
          },
        ],
      },
      {
        filename: 'empty-object-as-required-interface.ts',
        code: `
          interface MyInterface {
            id: number;
            name: string;
          }
          const val = {} as MyInterface;
        `,
        errors: [
          {
            messageId: 'literalTypeMismatch',
          },
        ],
      },
      {
        filename: 'partial-object-missing-required-property.ts',
        code: `
          interface User {
            id: number;
            name: string;
            email: string;
          }
          const user = { id: 1 } as User;
        `,
        errors: [
          {
            messageId: 'literalTypeMismatch',
          },
        ],
      },
      {
        filename: 'object-with-one-property-missing-others.ts',
        code: `
          interface Person {
            firstName: string;
            lastName: string;
            age: number;
          }
          const person = { firstName: "John" } as Person;
        `,
        errors: [
          {
            messageId: 'literalTypeMismatch',
          },
        ],
      },
      {
        filename: 'nested-object-missing-required-properties.ts',
        code: `
          interface Address {
            street: string;
            city: string;
            zipCode: string;
          }
          const addr = { street: "Main St" } as Address;
        `,
        errors: [
          {
            messageId: 'literalTypeMismatch',
          },
        ],
      },
    ],
  });
});

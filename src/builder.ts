import * as f from './filter';
import { z } from 'zod';

type KeyNotDup<
  In extends {},
  NotIn extends {},
  Key extends string
> = Key extends keyof In
  ? Key extends keyof NotIn
    ? `Key ${Key} is duplicated`
    : Key
  : Exclude<keyof In & string, keyof NotIn & string>;

type AddKeyToZodObject<O extends z.AnyZodObject, K extends string, T> = O extends z.ZodObject<infer U>
  ? z.ZodObject<InterMerge<U & { [X in K]: T }>>
  : never;

type InterMerge<T> = T extends {}
  ? T extends infer U
    ? { [key in keyof U]: U[key] }
    : never
  : T;

type ZodShape<T extends z.AnyZodObject> = T extends z.ZodObject<infer S> ? S : never;

class SchemaBuilder<
  Record extends z.AnyZodObject,
  Schema extends z.AnyZodObject> 
{
  schema: Schema;
  record: Record;

  protected constructor(record: Record, schema: Schema) {
    this.schema = schema;
    this.record = record;
  }

  filter<K extends string>(
    key: KeyNotDup<ZodShape<Record>, ZodShape<Schema>, K>
    // key: KeyNotIn<Schema, K>
    ){
  // ): SchemaBuilder<Record, AddKeyToZodObject<Schema, K, (z.infer<Record>)[K]>> {
    // type NewSchema = InterMerge<Schema & { [key in K]: string }>;
    return new SchemaBuilder(
      this.record,
      (this.schema.extend({ [key]: this.getZodParser(key as string & keyof Record) })) as AddKeyToZodObject<Schema, K, (ZodShape<Record>)[K]>
    );
  }

  private getZodParser(key: string & keyof Record) {
    if (typeof this.record[key] === 'string'){
      return z.string();
    } else if (typeof this.record[key] === "number") {
      return z.number();
    } else if (typeof this.record[key] === "boolean") {
      return z.boolean();
    } else {
      throw new Error(
        "Builder error: Unsupported type -" + typeof typeof this.record[key]
      );
    }
  }

  build() {
    return this.schema;
  }

  static schemaBuilder<Record extends z.AnyZodObject>(record: Record) {
    return new SchemaBuilder(record, z.object({}));
  }
}

export function schemabuilder<Record extends z.AnyZodObject>(record: Record) {
  return SchemaBuilder.schemaBuilder(record);
}

// function getZodParser(record: Record, key: string) {

//   if (typeof item === 'string') {
//     return z.string();
//   } else if (typeof item === 'number') {
//     return z.number();
//   } else if (typeof item === 'boolean') {
//     return z.boolean();
//   } else {
//     throw new Error("Unsupported type:" + typeof item);
//   }

// }

/////////// TEST CODE

const test = z.object({
    a: z.string(),
    b: z.number(),
    c: z.boolean(),
  });

let ch = z.object({});
let cb = ch.extend({ a: z.string() }).extend({b: z.string()});
type Ch = z.infer<typeof cb>;
type shape = ZodShape<typeof cb>;

let sb = schemabuilder(test);
let parse = sb.filter('a').filter('b').build();
type f = z.infer<typeof parse>;
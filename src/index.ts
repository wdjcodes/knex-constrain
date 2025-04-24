import knex, { Knex } from "knex";
import { filter, FilterConstraint } from "./filter";


export function attachConstraints(){
  knex.QueryBuilder.extend("constrain", constrain);
  knex.QueryBuilder.extend("filter", filter);
}

function constrain<TRecord extends {} = any, TResult = any>(
  this: Knex.QueryBuilder<TRecord, TResult>,
  constraint: Constraint<TRecord>
) {
  if(!constraint) {
    return this;
  }
  if (constraint.filter) {
    this.filter(constraint.filter);
  }

  return this;
}

export type Constraint<TRecord> = {
    filter?: FilterConstraint<TRecord>
};

declare module "knex" {
  namespace Knex {
    interface QueryBuilder<TRecord extends {} = any, TResult = any> {
      constrain(
        constraint?: Constraint<TRecord>
      ): Knex.QueryBuilder<TRecord, TResult>;
      filter(
        filter?: FilterConstraint<TRecord>
      ): Knex.QueryBuilder<TRecord, TResult>;
    }
  }
}

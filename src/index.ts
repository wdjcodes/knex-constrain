import knex, { Knex } from "knex";

export function attachConstraints(){
  knex.QueryBuilder.extend("constrain", constrain);
  knex.QueryBuilder.extend("filter", filter);
}

function constrain<TRecord extends {} = any, TResult = any>(
  this: Knex.QueryBuilder<TRecord, TResult>,
  constraint: Constraint
) {
  if(!constraint) {
    return this;
  }
  if (constraint.filter) {
    this.filter(constraint.filter);
  }

  return this;
}

function filter<TRecord extends {} = any, TResult = any>(
  this: Knex.QueryBuilder<TRecord, TResult>,
  filter?: FilterConstraint
) {
  if(!filter) {
    return this;
  }
  for (const k in filter) {
    let c = filter.k;
    if (c.eq) {
      this.where(k, "=", c.eq);
    }
  }

  return this;
}

export type Constraint = {
  filter?: FilterConstraint;
};

export type FilterConstraint = {
  [k: string]: ConstraintOperator;
};

type ConstraintOperator = EqConstraint;

type EqConstraint = {
  eq: string | number;
};

declare module "knex" {
  namespace Knex {
    interface QueryBuilder<TRecord extends {} = any, TResult = any> {
      constrain(
        constraint?: Constraint
      ): Knex.QueryBuilder<TRecord, TResult>;
      filter(
        filter?: FilterConstraint
      ): Knex.QueryBuilder<TRecord, TResult>;
    }
  }
}

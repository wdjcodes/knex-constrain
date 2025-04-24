import { Knex } from 'knex';
enum FilterOp {
    Eq ='eq',
    Neq = 'neq',
    Gt = 'gt',
    Lt = 'lt',
    Gte = 'gte',
    Lte = 'lte',
    In = 'in',
    Between = 'between',
}

export function filter<Filter, TRecord extends {}, TResult>(
  this: Knex.QueryBuilder<TRecord, TResult>,
  filter?: FilterConstraint<Filter>) {
  if (!filter) {
    return this;
  }
  
  let k: keyof typeof filter;
  for (k in filter) {
    if(k !in filter._filterable) {
      continue;
    }
    let c = filter[k];
    if (c === undefined) {
      continue;
    } else if (FilterOp.Eq in c) {
      this.where(k, "=", c.eq);
    } else if (FilterOp.Neq in c) {
      this.where(k, '!=', c.neq);
    } else if (FilterOp.Gt in c) {
      this.where(k, ">", c.gt);
    } else if (FilterOp.Lt in c) {
      this.where(k, "<", c.lt);
    } else if (FilterOp.Gte in c) {
      this.where(k, ">=", c.gte);
    } else if (FilterOp.Lte in c) {
      this.where(k, "<=", c.lte);
    } else if (FilterOp.In in c) {
      this.whereIn(k, c.in);
    } else if (FilterOp.Between in c) {
      this.whereBetween(k, c.between);
    }
  }

  return this;
}

export type FilterConstraint<Filter> = 
  { readonly _filterable: (keyof Filter)[] } &
  { [key in string & keyof Filter]?: ConstraintOperator<Filter[key]>; };

type ConstraintOperator<T> = 
    EqConstraint<T>         |
    NeqConstraint<T>        |
    GtConstraint<T>         |
    LtConstraint<T>         |
    GteConStraint<T>        |
    LteConstraint<T>        |
    InConstraint<T>         |
    BetweenConstraint<T>    ;

type EqConstraint<T> = {
  [FilterOp.Eq]: T;
};

type NeqConstraint<T> = {
  [FilterOp.Neq]: T;
};

type GtConstraint<T> = {
    [FilterOp.Gt]: T;
}

type LtConstraint<T> = {
    [FilterOp.Lt]: T;
}

type GteConStraint<T> = {
    [FilterOp.Gte]: T;
}

type LteConstraint<T> = {
    [FilterOp.Lte]: T;
}

type InConstraint<T> = {
    [FilterOp.In]: T[];
}

type BetweenConstraint<T> = {
    [FilterOp.Between]: [T, T];
}

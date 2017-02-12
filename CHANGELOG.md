## `v2.8.0` (2017-02-12)

* aliases now accessible in WHERE and GROUP BY:
  - `SELECT field AS alias WHERE alias = 123`
  - `SELECT field AS alias GROUP BY alias`


## `v2.7.0` (2017-02-08)

* `NOT IN` and `NOT STRICT IN`
* Way to bind pluggable data transfors


## `v2.6.0` (2017-01-27)

* Multiline JSON objects are supported


## `v2.5.0` (2017-01-23)

* `REGEXP` support: `"string" REGEXP "/pattern/im"`
* `BETWEEN` support
* `IS` support:
  - `IS [NOT] NULL`
  - `IS [NOT] BOOL` and alias `IS [NOT] BOOLEAN`
  - `IS [NOT] NUMBER`
  - `IS [NOT] ARRAY`
  - `IS [NOT] OBJECT`
  - `IS [NOT] STRING`


## `v2.4.0` (2017-01-20)

* `LIKE` and `ILIKE` (case-insensitive `LIKE`) was added
* Automatical type coercion in date comparisons like `ts > NOW() - INTERVAL 1 DAY`


## `v2.3.0` (2017-01-19)

* `SELECT ... FROM dataSource` support
* JSON objects can now be created as `{key: "value"}` not only JSON-compliant form `{"key": "value"}`


## `v2.2.0` (2017-01-01)

* New aggregation function: `AVG()`


## `v2.1.0` (2016-12-22)

* Arrays now supports multi-value bindings: `SELECT [1, 2, ::other, 3]`


## `v2.0.0` (2016-12-21)

Breaking changes:

* Identifier binding syntax changed: `[:bind]` -> `{:bind}`
* `INSERT row1[, row2...]` syntax changed to `INSERT VALUES row1[, row2...]`

New features:

* Bindings and column values in JSON: `SELECT {"column": columnName, "binded": :bind}`
* `INSERT` now supports bindings


## `v1.5.0` (2016-12-20)

* `SELECT DISTINCT ...` support
* `SELECT COUNT(DISTINCT ...)` support


## `v1.4.0` (2016-12-14)

* Added support for constant JSON-values
* Support for `DELETE WHERE` queries
* Support for `INSERT {object}[,{object}]` queries. Rows just was aded to end of the input stream
* Support for `UPDATE` queries
* Added support for E-notation for floating numbers
* Support for `SELECT *, [fields...]`


## `v1.3.0` (2016-12-05)

* Added the ability to manipulate dates using the INTERVAL operators
* `DATE()` now return dates in local timezone instead of UTC


## `v1.2.0` (2016-12-03)

* Binding can now be used for data sources (`JOIN [:name] ON @name.field = field`)
* Sorting strings are now always done in byte-by-byte representation of the string in UTF-8.
  Made to be compatible with the sorting of `sort`


## `v1.1.0` (2016-12-01)

New features:
* Identifiers binding ([#1](https://github.com/avz/node-jl-sql-api/issues/1))

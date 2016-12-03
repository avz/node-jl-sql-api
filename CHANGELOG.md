## `v1.2.0` (2016-12-03)

* Binding can now be used for data sources (`JOIN [:name] ON @name.field = field`)
* Sorting strings are now always done in byte-by-byte representation of the string in UTF-8.
  Made to be compatible with the sorting of `sort`

## `v1.1.0` (2016-12-01)

New features:
* Identifiers binding ([#1](https://github.com/avz/node-jl-sql-api/issues/1))

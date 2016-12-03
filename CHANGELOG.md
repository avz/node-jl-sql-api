## `v1.2.0` (2016-12-03)

* Binding can now be used for data sources (`JOIN [:name] ON @name.field = field`)
* Сортировка строк теперь всегда делается побайтово по представлению строки в UTF-8.
	Сделано для совместимости с сортировкой в `sort`

## `v1.1.0` (2016-12-01)

New features:
* Identifiers binding ([#1](https://github.com/avz/node-jl-sql-api/issues/1))

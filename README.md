# Fast CSV stream parser for Node.js

[![Build Status](https://travis-ci.org/avz/node-avz-csv.svg?branch=master)](https://travis-ci.org/avz/node-avz-csv)

## Sub-project of [jl-sql](https://github.com/avz/jl-sql). Not for external use.

### Installation

```
npm install @avz/csv
```

### Benchmark results

```
short-lines {"batch":false} [x500400, 28.2 MiB]: 5.799 sec (13510799 rows, 2329723 rows per cpu user sec)
short-lines {"batch":false,"rtrim":true,"ltrim":true} [x500400, 28.2 MiB]: 6.074 sec (13510799 rows, 2224521 rows per cpu user sec)
short-lines {"batch":true} [x500400, 28.2 MiB]: 3.358 sec (13510799 rows, 4022932 rows per cpu user sec)
large-lines {"batch":false} [x50000, 333.6 MiB]: 4.756 sec (249999 rows, 52565 rows per cpu user sec)
large-lines {"batch":false,"rtrim":true,"ltrim":true} [x50000, 333.6 MiB]: 4.438 sec (249999 rows, 56332 rows per cpu user sec)
large-lines {"batch":true} [x50000, 333.6 MiB]: 4.263 sec (249999 rows, 58641 rows per cpu user sec)
numbers {"batch":true,"detectNumbers":false} [x500152, 25.3 MiB]: 1.292 sec (5001519 rows, 3871987 rows per cpu user sec)
numbers {"batch":true,"detectNumbers":true} [x500152, 25.3 MiB]: 2.452 sec (5001519 rows, 2039630 rows per cpu user sec)
dates {"batch":true,"detectDates":false} [x500129, 60.6 MiB]: 1.390 sec (3000774 rows, 2159063 rows per cpu user sec)
dates {"batch":true,"detectDates":true} [x500129, 60.6 MiB]: 3.316 sec (3000774 rows, 905036 rows per cpu user sec)
```

# executor-sandbox (docker version)
- Minimal basic compose config with node.js and mongodb
- a simple http request handler that runs `code` received with `args` received and returns `results`
----
## todo
- timeouts
- have a way to start this on demand
- handle failover inc ase of errors system shall remain stable
- handle timeouts in `vm`



----
## Steps
- `have docker and docker-compose installed`
- `have docker daemon running`
- if needed do `docker-machine start default`
- `docker-compose build `
- `docker-compose up `

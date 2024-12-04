# @supabase-kit/cli

## install

```bash
  npm i @supabase-kit/cli -D
```

```bash
  bun add @supabase-kit/cli -D
```

```bash
  pnpm add @supabase-kit/cli -D
```

```bash
  yarn add @supabase-kit/cli -D
```

## get start

step 1:

* ```bash
    npm run supa init --name=supa -pf=5432 -fm=react
  ```

step 2:

* ```bash
  npm run supa migrate init
  ```

### run commnad

* init — [options] Init project
* migrate — manager migrastions and db flow
* types — Basic commands to generate types based on the DB, we recommend using
    Supabase CLI directly for greater optimization

### init

init proyect define folder structure, install extra tools.

```bash
  npm run supa init --name=supa -pf=5432 -fm=react
```

* n, --name name project (default: "supa")
* pf --port_family port family by docker container for local dev (default: "5432")
* fm, --framework "react" or "next"  extra tools by framework

### migrate

create migration flow this include create folders structure and prisma schemas, define local docker container, write **.env** variables for connect to local db.

```bash
  npm run supa migrate init
```

init migration flow by proyect.

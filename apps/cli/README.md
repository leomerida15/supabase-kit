# Supa-Kit CLI

CLI tool for comparing and migrating PostgreSQL databases using SQL patches.

Made with love by GobernAI LLC and LatamEarth C.A.

- https://gobern.ai/
- https://latamearth.com

## Requirements

- **Bun** >= 1.3 or **Node.js** >= 20
- Access to PostgreSQL databases (source and target)

## Installation

### Global installation from npm (recommended)

```bash
npm install -g @supabase-kit/cli
```

Or using Bun:

```bash
bun add -g @supabase-kit/cli
```

### Local installation from source

If you're working from the repository:

```bash
# From the monorepo root
bun install

# Build the CLI
cd apps/cli
bun run build
```

To use the CLI locally after building:

```bash
# From apps/cli
bun run index.ts diff [subcommand]

# Or if installed globally
supa-kit diff [subcommand]
```

## Usage

### Running the CLI

```bash
supa-kit
```

Without arguments, the CLI will display the welcome message with the list of available commands.

### General syntax

```bash
supa-kit diff [subcommand]
```

## Commands

The CLI uses `diff` as the root command. All commands are organized as subcommands of `diff`:

| Command        | Description                                     |
| -------------- | ----------------------------------------------- |
| `diff`         | Root command - shows available subcommands      |
| `diff add`     | Add application, environment, or comparison     |
| `diff ls`      | List applications, environments, and comparisons|
| `diff compare` | Generate SQL patch (compare databases)          |
| `diff migrate` | Run migrations (apply pending patches)          |
| `diff status`  | View status of all patches                      |
| `diff history` | View history of applied patches                 |

### `diff` - Root command

Displays the list of available subcommands.

**Usage:**

```bash
supa-kit diff
```

Shows all available subcommands under `diff`.

### `diff add` - Add configuration

Allows creating new applications, environments, and comparisons.

**Usage:**

```bash
supa-kit diff add
```

**What it does:**

- Allows creating or selecting an application
- Allows adding new environments (database connection configuration)
- Allows creating comparisons between environments (source and target)
- Configures comparison and migration options

**Interactive flow:**

1. Select or create application
2. Choose between creating an environment or comparison
3. If environment: configure connection (host, port, database, user, ssl)
4. If comparison: select source and target environments, configure options

### `diff ls` - List configuration

Displays information about configured applications, environments, and comparisons.

**Usage:**

```bash
supa-kit diff ls
```

**What it does:**

- Lists all configured applications
- Allows selecting an application to view details
- Shows environments configured in the application
- Shows comparisons configured between environments

### `diff compare` - Generate SQL patch

Compares two databases and generates an SQL file with the differences (patch).

**Usage:**

```bash
supa-kit diff compare
```

**What it does:**

1. Allows selecting an application
2. Allows selecting a configured comparison
3. Requests credentials for both databases (source and target)
4. Compares the schemas of both databases
5. Generates an SQL patch file with the differences
6. Saves the patch in the configured directory

**Note:** Patches are saved with unique timestamp-based names to avoid overwrites.

### `diff migrate` - Apply migrations

Executes pending SQL patches on the target database.

**Usage:**

```bash
supa-kit diff migrate
```

**What it does:**

1. Allows selecting an application
2. Allows selecting a configured comparison
3. Requests migration options:
   - **Force execution**: Execute patches even if they have errors
   - **Execute on source**: Execute on the source database instead of target
4. Requests target database credentials
5. Applies pending patches in order
6. Records applied patches in history

**Important options:**

- **Force execution**: Useful when there are patches that may fail but you want to continue
- **Execute on source**: Allows synchronizing the source database with the changes

### `diff status` - View patch status

Displays the current status of all patches (pending, applied, with errors).

**Usage:**

```bash
supa-kit diff status
```

**What it does:**

1. Allows selecting an application
2. Allows selecting a comparison
3. Connects to the target database
4. Shows the status of each patch:
   - **Pending**: Patches not applied
   - **Applied**: Already applied patches
   - **Error**: Patches that failed when applying

### `diff history` - View history

Displays the history of patches applied to a database.

**Usage:**

```bash
supa-kit diff history
```

**What it does:**

1. Allows selecting an application
2. Allows selecting a comparison
3. Connects to the target database
4. Shows the complete history of applied patches
5. Includes information such as application date, patch name, etc.

## Complete Migration Flow

The following describes the step-by-step flow to perform a complete database migration.

### Step 1: Configure the application and environments

If this is your first time using the CLI, you need to configure the application and environments:

```bash
# Run the add command
supa-kit diff add
```

**Flow:**

1. Create a new application (or select existing)
2. Add **source** environment (origin database)
3. Add **target** environment (destination database)
4. Create a comparison that relates source and target

**Configuration example:**

- Application: `my-project`
- Source environment: `dev` (localhost:5432/dev)
- Target environment: `qa` (localhost:5432/qa)
- Comparison: `dev-to-qa`

### Step 2: Verify configuration

Before generating patches, verify that the configuration is correct:

```bash
supa-kit diff ls
```

This will allow you to verify that environments and comparisons are configured correctly.

### Step 3: Generate SQL patches

Compare the databases and generate the SQL patches:

```bash
supa-kit diff compare
```

**Process:**

1. Select the application (`my-project`)
2. Select the comparison (`dev-to-qa`)
3. Enter the source database credentials
4. Enter the target database credentials
5. The CLI compares both databases
6. An SQL patch file is generated with the differences

**Result:**

An SQL file is created in the configured directory (default `./patches/`) with a unique timestamp-based name, for example: `20240101120000_dev-to-qa.sql`

### Step 4: Verify patch status

Before applying migrations, verify the patch status:

```bash
supa-kit diff status
```

**Process:**

1. Select the application
2. Select the comparison
3. Enter the target database credentials
4. The CLI shows the status of all patches:
   - Patches pending to apply
   - Already applied patches
   - Patches with errors

**Result:**

You can see which patches are ready to apply and which have already been applied previously.

### Step 5: Apply migrations

Execute the pending patches on the target database:

```bash
supa-kit diff migrate
```

**Process:**

1. Select the application
2. Select the comparison
3. Choose the options:
   - **Force execution**: `No` (recommended for production)
   - **Execute on source**: `No` (apply to target)
4. Enter the target database credentials
5. The CLI applies the pending patches in order
6. Shows migration progress

**Result:**

Patches are applied sequentially to the target database. If any patch fails, the process stops (unless you use force execution).

### Step 6: Verify history

After applying migrations, verify the history:

```bash
supa-kit diff history
```

**Process:**

1. Select the application
2. Select the comparison
3. Enter the target database credentials
4. The CLI shows the complete history of applied patches

**Result:**

You can see a complete record of all patches that have been applied, including dates and file names.

## Recommended Command Order

To perform a complete migration for the first time:

```bash
# 1. Configure (only the first time)
supa-kit diff add

# 2. Verify configuration
supa-kit diff ls

# 3. Generate patches
supa-kit diff compare

# 4. Verify status before migrating
supa-kit diff status

# 5. Apply migrations
supa-kit diff migrate

# 6. Verify history
supa-kit diff history
```

For subsequent migrations (when already configured):

```bash
# 1. Generate new patches
supa-kit diff compare

# 2. Verify status
supa-kit diff status

# 3. Apply migrations
supa-kit diff migrate

# 4. Verify history
supa-kit diff history
```

## Configuration Structure

Configurations are stored in `.diffconfig.json` files in each application's directory.

**Location:**

```
.config/
└── [application-name]/
    └── [application-name].diffconfig.json
```

**Configuration file structure:**

```json
{
    "entornos": {
        "dev": {
            "host": "localhost",
            "port": 5432,
            "database": "dev",
            "user": "dev",
            "ssl": true,
            "applicationName": "dev"
        },
        "qa": {
            "host": "localhost",
            "port": 5432,
            "database": "qa",
            "user": "qa",
            "ssl": true,
            "applicationName": "qa"
        }
    },
    "comparaciones": {
        "dev-to-qa": {
            "sourceClient": "dev",
            "targetClient": "qa",
            "compareOptions": {
                "outputDirectory": "./patches"
            },
            "migrationOptions": {
                "patchesDirectory": "./patches"
            }
        }
    }
}
```

## Important Notes

1. **Credentials**: Passwords are not stored in configuration files for security. They are requested in each operation that requires them.

2. **Unique patches**: Each generated patch has a unique timestamp-based name to avoid overwrites.

3. **Application order**: Patches are applied in chronological order (by file name).

4. **Target database**: By default, migrations are applied to the target database. You can use the "Execute on source" option to apply to the source database.

5. **Force execution**: Use with caution. It allows continuing with patches that have errors, but may leave the database in an inconsistent state.

## Troubleshooting

### Error: "No applications configured"

Run `supa-kit diff add` to create your first application and configuration.

### Error: "No comparisons configured"

Run `supa-kit diff add` and create a comparison for your application.

### Database connection error

Verify that:

- Credentials are correct
- Database is accessible
- Connection parameters (host, port) are correct
- SSL is configured correctly

### Error when applying patches

1. Verify status with `supa-kit diff status`
2. Review specific error messages
3. Verify there are no data conflicts
4. Consider using `force execution` only if necessary and you understand the consequences

## Support

For more information and support:

- **Repository**: https://github.com/leomerida15/supabase-kit
- **GobernAI**: https://gobern.ai/
- **LatamEarth**: https://latamearth.com

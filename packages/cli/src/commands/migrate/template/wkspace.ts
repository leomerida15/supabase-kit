export const wkSpace = `
{
    "folders": [
        {
            "name": "project-root",
            "path": "./",
        },
        {
            "name": "supabase-functions",
            "path": "supabase/functions",
        },
    ],
    "settings": {
        "files.exclude": {
            "node_modules/": true,
            "app/": true,
            "supabase/functions/": true,
        },
        "deno.importMap": "./supabase/functions/deno.json",
    },
}
`;

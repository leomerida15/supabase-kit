export function parseToEnv(text: string) {
    // Usamos expresiones regulares para encontrar y convertir cada línea relevante
    const envVariables = text
        .split('\n') // Dividir el texto en líneas
        .map<[string, string]>((line) => {
            if (line.includes('API URL')) return ['API_URL', `${line.split(': ')[1].trim()}`];
            if (line.includes('GraphQL URL'))
                return ['GRAPHQL_URL', `${line.split(': ')[1].trim()}`];
            if (line.includes('S3 Storage URL'))
                return ['S3_STORAGE_URL', `${line.split(': ')[1].trim()}`];
            if (line.includes('DB URL')) return ['DB_URL', `${line.split(': ')[1].trim()}`];
            if (line.includes('Studio URL')) return ['STUDIO_URL', `${line.split(': ')[1].trim()}`];
            if (line.includes('Inbucket URL'))
                return ['INBUCKET_URL', `${line.split(': ')[1].trim()}`];
            if (line.includes('JWT secret')) return ['JWT_SECRET', `${line.split(': ')[1].trim()}`];
            if (line.includes('anon key')) return ['ANON_KEY', `${line.split(': ')[1].trim()}`];
            if (line.includes('service_role key'))
                return ['SERVICE_ROLE_KEY', `${line.split(': ')[1].trim()}`];
            if (line.includes('S3 Access Key'))
                return ['S3_ACCESS_KEY', `${line.split(': ')[1].trim()}`];
            if (line.includes('S3 Secret Key'))
                return ['S3_SECRET_KEY', `${line.split(': ')[1].trim()}`];
            if (line.includes('S3 Region')) return ['S3_REGION', `${line.split(': ')[1].trim()}`];
            return null as unknown as [string, string];
        })
        .filter(Boolean);

    return Object.fromEntries(envVariables);
}

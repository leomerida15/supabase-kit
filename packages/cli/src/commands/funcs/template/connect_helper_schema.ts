export const connect_helper_schema = `
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["multiSchema"]
  binaryTargets   = ["native"]
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
`;

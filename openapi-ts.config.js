import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
  input: '../cv-backend/api/swagger.yaml',
  output: 'src/api/generated',
})
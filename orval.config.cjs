module.exports = {
  api: {
    input: 'http://localhost:8080/v3/api-docs',
    output: {
      target: './src/api/generated.ts',
      client: 'react-query',
      mode: 'single',
      prettier: true,
      override: {
        mutator: {
          path: './src/axios-instance.ts',
          name: 'axiosInstance',
        },
        baseUrl: 'http://localhost:8080',
        formData: true,
      },
    },
  },
};

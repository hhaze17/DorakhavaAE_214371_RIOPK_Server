export const swaggerDocument = {
    openapi: '3.0.0',
    info: {
      title: 'Документация API | RIOPK | Дорохова АЕ',
      version: '1.0.0',
      description: 'Программная система учета и анализа товаров в коммерческой зоне торговой компании',
    },
    servers: [
      {
        url: 'http://localhost:8081',
        description: 'Локальный сервер',
      },
    ],
    paths: {
      '/api/user/register': {
        post: {
          summary: 'Регистрация нового пользователя',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          responses: {
            201: { description: 'Пользователь зарегистрирован' },
            400: { description: 'Ошибка регистрации' },
          },
        },
      },
      '/api/user/login': {
        post: {
          summary: 'Аутентификация пользователя',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    username: { type: 'string' },
                    password: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Успешная авторизация' },
            401: { description: 'Неверные учетные данные' },
          },
        },
      },
      '/api/products': {
        get: {
          summary: 'Получить список всех товаров',
          responses: {
            200: {
              description: 'Список товаров',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Product' },
                  },
                },
              },
            },
          },
        },
        post: {
          summary: 'Создать новый товар',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Product' },
              },
            },
          },
          responses: {
            201: { description: 'Товар создан' },
          },
        },
      },
      '/api/zones': {
        get: {
          summary: 'Получить список всех зон',
          responses: {
            200: { description: 'Список зон' },
          },
        },
        post: {
          summary: 'Создать новую зону',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Zone' },
              },
            },
          },
          responses: {
            201: { description: 'Зона создана' },
          },
        },
      },
      '/api/product-movements': {
        post: {
          summary: 'Переместить товар между зонами',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    productId: { type: 'string' },
                    fromZoneId: { type: 'string' },
                    toZoneId: { type: 'string' },
                    quantity: { type: 'integer' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Перемещение выполнено' },
            400: { description: 'Ошибка перемещения' },
          },
        },
      },
      '/api/orders': {
        get: {
          summary: 'Получить заказы текущего пользователя',
          responses: {
            200: { description: 'Список заказов' },
          },
        },
        post: {
          summary: 'Создать новый заказ',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    items: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          productId: { type: 'string' },
                          quantity: { type: 'integer' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Заказ создан' },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            username: { type: 'string' },
            password: { type: 'string' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            levelOfAccess: { type: 'string' },
          },
        },
        Product: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            brandName: { type: 'string' },
            productModel: { type: 'string' },
            category: { type: 'string' },
            price: { type: 'number' },
            quantity: { type: 'integer' },
            zone: { type: 'string' },
          },
        },
        Zone: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            type: { type: 'string' },
            capacity: { type: 'integer' },
          },
        },
      },
    },
  };
  
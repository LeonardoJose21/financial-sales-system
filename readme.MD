# Sistema de Gestión de Ventas de Productos Financieros

Sistema completo de gestión de ventas de productos financieros con autenticación JWT, CRUD de usuarios y ventas, validación CAPTCHA, y panel de estadísticas.

## 🚀 Tecnologías Utilizadas

### Backend
- Node.js + Express
- PostgreSQL
- JWT (JSON Web Tokens)
- Bcrypt (encriptación de contraseñas)
- Sequelize ORM
- Express Validator

### Frontend
- React 18
- Redux Toolkit
- React Router v6
- Axios
- Tailwind CSS
- Recharts (gráficos)
- React Hook Form

## 📋 Requisitos Previos

- Node.js 16+ y npm
- PostgreSQL 12+
- Git

## 🔧 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone <tu-repositorio>
cd financial-sales-system
```

### 2. Configurar Base de Datos

Crear base de datos en PostgreSQL:

```sql
CREATE DATABASE financial_sales_db;
```

### 3. Configurar Backend

```bash
cd backend
npm install
```

Crear archivo `.env` en la carpeta `backend`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=financial_sales_db
DB_USER=postgres
DB_PASSWORD=tu_password

JWT_SECRET=tu_clave_secreta_muy_segura_cambiala_en_produccion
JWT_EXPIRES_IN=24h

NODE_ENV=development
```

### 4. Configurar Frontend

```bash
cd frontend
npm install
```

Crear archivo `.env` en la carpeta `frontend`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 5. Inicializar Base de Datos

Desde la carpeta `backend`:

```bash
npm run db:init
```

Este comando creará las tablas y un usuario administrador por defecto:
- Email: admin@banco.com
- Password: Admin123!

## 🚀 Ejecutar la Aplicación

### Opción 1: Desarrollo Normal

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm start
```

La aplicación estará disponible en:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Opción 2: Con Docker (Opcional)

```bash
docker-compose up
```

## 👤 Usuarios de Prueba

### Administrador
- Email: admin@banco.com
- Password: Admin123!

### Asesor
- Email: asesor@banco.com
- Password: Asesor123!

## 📁 Estructura del Proyecto

```
financial-sales-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Sale.js
│   │   │   └── Role.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   └── saleController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── validation.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   └── sales.js
│   │   ├── services/
│   │   │   └── captchaService.js
│   │   └── app.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   ├── Users/
│   │   │   ├── Sales/
│   │   │   ├── Dashboard/
│   │   │   └── Layout/
│   │   ├── redux/
│   │   │   ├── slices/
│   │   │   └── store.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   └── App.js
│   ├── package.json
│   └── .env
│
├── docker-compose.yml
└── README.md
```

## 🔐 Características Implementadas

### Core Features
- ✅ Sistema de autenticación con JWT
- ✅ Validación CAPTCHA en backend
- ✅ CRUD completo de usuarios
- ✅ CRUD completo de ventas
- ✅ Encriptación de contraseñas con Bcrypt
- ✅ Roles de usuario (Administrador/Asesor)
- ✅ Validaciones frontend y backend
- ✅ Campos condicionales según tipo de producto
- ✅ Filtrado de ventas por rol

### Features Adicionales (Plus)
- ✅ UI moderna con Tailwind CSS
- ✅ Gestión de estados de ventas (Abierto/En Proceso/Finalizado)
- ✅ Dashboard con estadísticas y gráficos
- ✅ Sumatoria de cupos solicitados
- ✅ Historial de cambios con usuarios
- ✅ Docker support
- ✅ Programación orientada a objetos
- ✅ Redux para manejo de estado
- ✅ React Hooks y componentes funcionales

## 🎯 Funcionalidades por Rol

### Administrador
- Ver todas las ventas de todos los usuarios
- Crear, editar y eliminar usuarios
- Crear, editar y eliminar ventas
- Cambiar estados de ventas
- Ver dashboard con estadísticas completas
- Ver estadísticas de todos los asesores

### Asesor
- Ver solo sus propias ventas
- Crear y editar sus ventas
- Ver dashboard con sus propias estadísticas
- No puede gestionar usuarios

## 📊 Módulos Implementados

1. **Autenticación**
   - Login con email/password
   - CAPTCHA matemático validado en backend
   - JWT tokens
   - Sesión persistente

2. **Gestión de Usuarios** (Solo Admin)
   - Lista de usuarios con paginación
   - Crear nuevo usuario
   - Editar usuario existente
   - Eliminar usuario
   - Validaciones completas

3. **Gestión de Ventas**
   - Lista de ventas con filtros
   - Crear nueva venta
   - Editar venta
   - Eliminar venta
   - Visualizar detalle
   - Campos condicionales (Franquicia/Tasa)

4. **Dashboard**
   - Total de cupos solicitados
   - Gráfico de ventas por producto
   - Gráfico de ventas por asesor
   - Gráfico de ventas por fecha
   - Tabla de ventas recientes

5. **Back Office**
   - Estados de venta: Abierto → En Proceso → Finalizado
   - Historial de cambios de estado
   - Tracking de usuarios que modifican

## 🧪 Testing

Backend:
```bash
cd backend
npm test
```

Frontend:
```bash
cd frontend
npm test
```

## 📦 Scripts Disponibles

### Backend
- `npm start` - Iniciar servidor producción
- `npm run dev` - Iniciar servidor desarrollo
- `npm run db:init` - Inicializar base de datos
- `npm test` - Ejecutar tests

### Frontend
- `npm start` - Iniciar app desarrollo
- `npm run build` - Build para producción
- `npm test` - Ejecutar tests

## 🐳 Docker

Construir y ejecutar con Docker:

```bash
docker-compose up --build
```

Detener:
```bash
docker-compose down
```

## 🔒 Seguridad

- Contraseñas encriptadas con Bcrypt (10 rounds)
- Tokens JWT con expiración
- Validación de entrada en frontend y backend
- Protección contra SQL Injection (Sequelize ORM)
- CORS configurado
- Rate limiting en endpoints sensibles
- Validación CAPTCHA

## 📝 API Endpoints

### Auth
- POST `/api/auth/login` - Login de usuario
- POST `/api/auth/verify-captcha` - Verificar CAPTCHA
- GET `/api/auth/me` - Obtener usuario actual

### Users (Admin only)
- GET `/api/users` - Lista de usuarios
- POST `/api/users` - Crear usuario
- PUT `/api/users/:id` - Actualizar usuario
- DELETE `/api/users/:id` - Eliminar usuario

### Sales
- GET `/api/sales` - Lista de ventas
- POST `/api/sales` - Crear venta
- PUT `/api/sales/:id` - Actualizar venta
- DELETE `/api/sales/:id` - Eliminar venta
- PATCH `/api/sales/:id/status` - Cambiar estado
- GET `/api/sales/statistics` - Estadísticas

## 🚀 Deploy en AWS (Opcional)

1. EC2 para backend
2. RDS PostgreSQL para base de datos
3. S3 + CloudFront para frontend
4. Usar variables de entorno para configuración

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit cambios (`git commit -m 'Add nueva caracteristica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abrir Pull Request

## 📄 Licencia

MIT

## 👨‍💻 Autor

Tu Nombre - [tu-email@ejemplo.com]

## 📞 Soporte

Para soporte, email a soporte@banco.com
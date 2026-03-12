# Usar imagen oficial de Node.js
FROM node:18-slim

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de backend
COPY backend/package*.json ./backend/

# Instalar dependencias del backend
WORKDIR /app/backend
RUN npm install

# Copiar el código fuente del backend
COPY backend/ .

# Compilar TypeScript
RUN npm run build

# Exponer el puerto
EXPOSE 3001

# Comando de inicio
CMD ["node", "dist/server.js"]
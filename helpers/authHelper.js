import request from 'supertest';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

export async function loginAdmin(appInstance = BASE_URL, email = process.env.ADMIN_EMAIL || 'admin@escola.com', senha = process.env.ADMIN_PASSWORD || 'admin123') {
  const response = await request(appInstance)
    .post('/api/auth/login')
    .send({ email, senha });

  return response.body.token;
}

export async function loginAluno(appInstance = BASE_URL, email, senha) {
  const response = await request(appInstance)
    .post('/api/auth/login')
    .send({ email, senha });

  return response.body.token;
}

export default { loginAdmin, loginAluno };
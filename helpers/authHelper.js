const request = require('supertest');
require('dotenv').config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function loginAdmin() {
  const response = await request(BASE_URL)
    .post('api/auth/login') // Ajuste a rota de login de acordo com a API real
    .send({
      email: process.env.ADMIN_EMAIL,
      senha: process.env.ADMIN_PASSWORD
    });
  
  return response.body.token; // Retorna o token JWT de admin
}

async function loginAluno(email, senha) {
  const response = await request(BASE_URL)
    .post('api/auth/login') // Rota de login de usuário/aluno
    .send({ email, senha });
  
  return response.body.token; // Retorna o token JWT do aluno
}

module.exports = { loginAdmin, loginAluno };
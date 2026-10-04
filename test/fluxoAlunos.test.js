import request from 'supertest';
import { expect } from 'chai';
import 'dotenv/config';

import { loginAdmin, loginAluno } from '../helpers/authHelper.js';
import dadosTeste from '../data/alunoData.json' assert { type: 'json' };

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

describe('Fluxo E2E de Gestão de Alunos e Trabalhos', function () {
  let adminToken;
  let alunoToken;
  let alunoIdCadastrado;

  // Tornando os dados dinâmicos para poder rodar o teste várias vezes sem erro de conflito
  const timestamp = Date.now();
  const alunoDinamico = {
    ...dadosTeste.novoAluno,
    email: `carlos.${timestamp}@example.com`,
    matricula: `2026${timestamp.toString().slice(-4)}`
  };

  it('1. Deve logar como Administrador com sucesso', async function () {
    adminToken = await loginAdmin();
    expect(adminToken).to.be.a('string');
  });

  it('2. Deve cadastrar um novo aluno usando dados do JSON (Data-Driven)', async function () {
    const response = await request(BASE_URL)
      .post('/api/admin/alunos') // <-- Rota correta do admin
      .set('Authorization', `Bearer ${adminToken}`)
      .send(alunoDinamico);

    expect(response.status).to.equal(201);
    
    // Captura o ID do aluno gerado pela API para usar no passo de entrega de trabalho
    alunoIdCadastrado = response.body.id || response.body.aluno?.id;
  });

  it('3. Deve logar com o aluno recém-cadastrado', async function () {
    alunoToken = await loginAluno(alunoDinamico.email, alunoDinamico.senha);
    expect(alunoToken).to.be.a('string');
  });

  it('4. Deve registrar a entrega de um trabalho como aluno', async function () {
    const response = await request(BASE_URL)
      .post(`/api/alunos/${alunoIdCadastrado}/trabalhos`) // <-- Rota correta que exige o ID do aluno na URL
      .set('Authorization', `Bearer ${alunoToken}`)
      .send(dadosTeste.trabalho);

    expect(response.status).to.equal(201);
  });
});
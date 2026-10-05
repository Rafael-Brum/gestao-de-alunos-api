import request from 'supertest';
import { expect } from 'chai';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import 'dotenv/config';

import { loginAdmin, loginAluno } from '../helpers/authHelper.js';
import dadosTeste from '../data/alunoData.json' with { type: 'json' };

describe('Fluxo de autenticação e entrega de trabalho', function () {
  this.timeout(60000);

  let app;
  let mongoServer;
  let adminToken;
  let alunoToken;
  let alunoIdCadastrado;
  let alunoEmail;
  let alunoSenha;

  before(async function () {
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongoServer.getUri('gestao-de-alunos-test');

    const appModule = await import('../src/app.js');
    app = appModule.default;
  });

  after(async function () {
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  it('deve logar como administrador', async function () {
    adminToken = await loginAdmin(app);
    expect(adminToken).to.be.a('string');
  });

  it('deve cadastrar um aluno usando dados do arquivo JSON e matriculá-lo na disciplina', async function () {
    const timestamp = Date.now();
    alunoEmail = `carlos.${timestamp}@example.com`;
    alunoSenha = dadosTeste.novoAluno.senha;

    const alunoDinamico = {
      ...dadosTeste.novoAluno,
      email: alunoEmail,
      matricula: `2026${timestamp.toString().slice(-4)}`,
    };

    const cadastroResponse = await request(app)
      .post('/api/admin/alunos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(alunoDinamico);

    expect(cadastroResponse.status).to.equal(201);
    expect(cadastroResponse.body).to.have.property('id');
    alunoIdCadastrado = cadastroResponse.body.id;

    const matriculaResponse = await request(app)
      .post('/api/admin/disciplinas/disciplina-matematica/matriculas')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ alunoId: alunoIdCadastrado });

    expect(matriculaResponse.status).to.equal(201);
  });

  it('deve logar como aluno', async function () {
    alunoToken = await loginAluno(app, alunoEmail, alunoSenha);
    expect(alunoToken).to.be.a('string');
  });

  it('deve registrar a entrega de um trabalho como aluno', async function () {
    const response = await request(app)
      .post(`/api/alunos/${alunoIdCadastrado}/trabalhos`)
      .set('Authorization', `Bearer ${alunoToken}`)
      .send(dadosTeste.trabalho);

    expect(response.status).to.equal(201);
  });
});

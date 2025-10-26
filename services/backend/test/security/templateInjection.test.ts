/**
 *
 * Prueba de seguridad (Jest) que valida la mitigación del Template Injection
 * en la funcionalidad de creación de usuario (AuthService.createUser).
 *
 * Objetivo:
 *  - Verificar que los campos provistos por el usuario (first_name, last_name)
 *    que contengan patrones de template (EJS, Mustache-like, etc.) NO sean
 *    evaluados/interpetados en el HTML del correo de activación.
 *
 */

import nodemailer from 'nodemailer';
import AuthService from '../../src/services/authService';
import db from '../../src/db';
import { User } from '../../src/types/user';

// --- Mocks ---
// Mockeamos la DB para no tocar la base real durante las pruebas unitarias.
jest.mock('../../src/db');
const mockedDb = db as jest.MockedFunction<typeof db>;

// Mockeamos nodemailer para capturar el html que se enviaría sin enviar correos reales.
jest.mock('nodemailer');
const mockedNodemailer = nodemailer as jest.Mocked<typeof nodemailer>;

// Mock para sendMail; guardaremos las llamadas para inspeccionar el HTML enviado.
const sendMailMock = jest.fn().mockResolvedValue({ success: true });
mockedNodemailer.createTransport = jest.fn().mockReturnValue({
  sendMail: sendMailMock,
});

describe('Seguridad - Prevención de Template Injection en createUser', () => {
  // Guardamos el env original para restaurarlo luego del test.
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    // Definimos FRONTEND_URL para que el enlace en el template no salga "undefined".
    process.env = { ...OLD_ENV, FRONTEND_URL: 'http://localhost' };
  });

  afterEach(() => {
    // Restauramos env original al terminar cada test.
    process.env = OLD_ENV;
  });

  it('debe evitar la ejecución de código en nombres del usuario (mitigado)', async () => {
    // --- Datos de prueba (usuario con payload malicioso) ---
    const maliciousUser = {
      id: 'user-999',
      email: 'evil@example.com',
      password: 'pass123',
      first_name: '<%= 2 + 2 %>', 
      last_name: '{{7*7}}',       
      username: 'attacker',
    } as User;

    // --- Mocks de DB ---
    // Primer llamado: select (verifica que no exista usuario)
    const selectChain = {
      where: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValue(null), // No existe -> continua creación
    };
    // Segundo llamado: insert (simulamos la inserción)
    const insertChain = {
      returning: jest.fn().mockResolvedValue([maliciousUser]),
      insert: jest.fn().mockReturnThis(),
    };

    mockedDb
      .mockReturnValueOnce(selectChain as any)
      .mockReturnValueOnce(insertChain as any);

    // --- Ejecución: crear usuario (esto generará el HTML y "enviará" el mail mockeado)
    await AuthService.createUser(maliciousUser);

    // --- Inspección del correo "enviado" ---
    expect(sendMailMock).toHaveBeenCalled(); // se intentó enviar un correo
    const sendArgs = sendMailMock.mock.calls[0][0]; // primer llamado, primer arg (obj mail)
    const htmlBody: string = sendArgs.html;

    // --- Aserciones de seguridad documentadas ---

    // 1) La expresión EJS original no debe ser evaluada por el HTML
    //    Ejemplo esperado: "<%= 2 + 2 %>" -> "&lt;%= 2 + 2 %&gt;"
    expect(htmlBody).toContain('&lt;%= 2 + 2 %&gt;');

    // 2) El patrón {{ }} puede permanecer sin cambios, por eso esperamos
    //    encontrar '{{7*7}}' tal cual en el HTML.
    expect(htmlBody).toContain('{{7*7}}');

    // 3) NO debe aparecer el resultado evaluado en el saludo. Verificamos que
    //    no haya "Hello 4" ni "Hello 49" en el HTML.
    expect(htmlBody).not.toMatch(/Hello\s*4\b/);
    expect(htmlBody).not.toMatch(/Hello\s*49\b/);

    // 4) El link de activación debe contener FRONTEND_URL y la ruta de activación.
    //    Se valida el prefijo 'http://localhost/activate-user?token=' (token variable).
    expect(htmlBody).toContain('http://localhost/activate-user?token=');
  });
});

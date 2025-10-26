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

  /**
   * Caso de prueba: inyección de templates en first_name / last_name.
   *
   * Datos de prueba:
   *  - first_name contiene una expresión EJS: "<%= 2 + 2 %>"
   *  - last_name contiene una expresión estilo mustache: "{{7*7}}"
   *
   * Preparación (mocks):
   *  - La consulta SELECT a users devuelve null (no existe el usuario).
   *  - La inserción en DB se mockea para simular inserción exitosa.
   *
   * Ejecución:
   *  - Llamar a AuthService.createUser(maliciousUser)
   *
   * Comprobaciones (asserts) — lo que la consigna pide comprobar:
   * 1) El HTML enviado debe contener las expresiones ESCAPADAS cuando corresponda.
   *    (por ejemplo &lt;%= ... %&gt;). Esto demuestra que no se interpretó el tag.
   * 2) El HTML no debe contener el resultado evaluado en el saludo (por ejemplo
   *    "Hello 4" o "Hello 49"). Si apareciera, significaría que hubo ejecución.
   * 3) El enlace de activación debe construirse usando FRONTEND_URL (no "undefined").
   *
   * Resultado esperado:
   *  - En la branch vulnerables (main) la prueba debería FALLAR (porque ejs.render
   *    interpretaría la expresión y aparecerían los valores evaluados).
   *  - En la branch mitigada (practico-2) la prueba debería PASAR.
   */
  it('debe evitar la ejecución de código en nombres del usuario (mitigado)', async () => {
    // --- Datos de prueba (usuario con payload malicioso) ---
    const maliciousUser = {
      id: 'user-999',
      email: 'evil@example.com',
      password: 'pass123',
      first_name: '<%= 2 + 2 %>', // EJS-like
      last_name: '{{7*7}}',       // Mustache-like
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
    expect(sendMailMock).toHaveBeenCalled(); // sanity: se intentó enviar un correo
    const sendArgs = sendMailMock.mock.calls[0][0]; // primer llamado, primer arg (obj mail)
    const htmlBody: string = sendArgs.html;

    // --- Aserciones de seguridad documentadas ---

    // 1) La expresión EJS original debe aparecer ESCAPADA en el HTML (no evaluada).
    //    Ejemplo esperado: "<%= 2 + 2 %>" -> "&lt;%= 2 + 2 %&gt;"
    expect(htmlBody).toContain('&lt;%= 2 + 2 %&gt;');

    // 2) El patrón mustache-like puede permanecer sin cambios según mitigación
    //    (en nuestro mitigado actual, las llaves se dejan tal cual), por eso esperamos
    //    encontrar '{{7*7}}' tal cual en el HTML. Si la mitigación escapara también
    //    los '{' y '}' habría que ajustar la expectativa acorde.
    expect(htmlBody).toContain('{{7*7}}');

    // 3) NO debe aparecer el resultado evaluado en el saludo. Verificamos que
    //    no haya "Hello 4" ni "Hello 49" en el HTML. La comprobación apunta al
    //    contexto del saludo para evitar falsos positivos por otros "4" o "49".
    expect(htmlBody).not.toMatch(/Hello\s*4\b/);
    expect(htmlBody).not.toMatch(/Hello\s*49\b/);

    // 4) El link de activación debe contener FRONTEND_URL y la ruta de activación.
    //    Se valida el prefijo 'http://localhost/activate-user?token=' (token variable).
    expect(htmlBody).toContain('http://localhost/activate-user?token=');
  });
});

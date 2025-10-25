import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

import InvoiceService from '../../src/services/invoiceService';
import db from '../../src/db';
import { Invoice } from '../../src/types/invoice';

jest.mock('../../src/db')
const mockedDb = db as jest.MockedFunction<typeof db>


describe('AuthService.generateJwt', () => {
  beforeEach (() => {
    jest.resetModules();
  });

  beforeAll(() => {
  });

  afterAll(() => {
  });

 /*  it('listInvoices', async () => {
    const userId = 'user123';
    const state = 'paid';
    const operator = 'eq';
    const mockInvoices: Invoice[] = [
      { id: 'inv1', userId, amount: 100, dueDate: new Date(), status: 'paid' },
      { id: 'inv2', userId, amount: 200, dueDate: new Date(), status: 'paid' }
    ];
    // mock no user exists
    const selectChain = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      andWhereRaw: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue(mockInvoices),
    };
    mockedDb.mockReturnValue(selectChain as any);

    const invoices = await InvoiceService.list(userId, state, operator);

    expect(mockedDb().where).toHaveBeenCalledWith({ userId });
    expect(mockedDb().andWhereRaw).toHaveBeenCalledWith(" status " + operator +" 'paid'");
    expect(mockedDb().select).toHaveBeenCalled();
    expect(invoices).toEqual(mockInvoices);
  });

  it('listInvoices no state', async () => {
    const userId = 'user123';
    const mockInvoices: Invoice[] = [
      { id: 'inv1', userId, amount: 100, dueDate: new Date(), status: 'paid' },
      { id: 'inv2', userId, amount: 200, dueDate: new Date(), status: 'unpaid' }
    ];
    // mock no user exists
    const selectChain = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue(mockInvoices),
    };
    mockedDb.mockReturnValue(selectChain as any);
    const invoices = await InvoiceService.list(userId);

    expect(mockedDb().where).toHaveBeenCalledWith({ userId });
    expect(mockedDb().andWhere).not.toHaveBeenCalled();
    expect(mockedDb().select).toHaveBeenCalled();
    expect(invoices).toEqual(mockInvoices);
  }); */

  it("no permite inyección SQL: usa andWhere (parametrizado) y no andWhereRaw", async () => {
    const userId = "user123";
    // payload de inyección probado en la PoC
    const maliciousStatus = "paid' OR '1'='1";
    const operator = "=";

    const mockInvoices: Invoice[] = [
      { id: "inv1", userId, amount: 100, dueDate: new Date(), status: "paid" },
    ];

    // cadena de consulta simulada: andWhere debe ser llamada, andWhereRaw no
    const selectChain = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      andWhereRaw: jest.fn().mockReturnThis(), // si el servicio fuese vulnerable esto se llamaría
      select: jest.fn().mockResolvedValue(mockInvoices),
    };
    mockedDb.mockReturnValue(selectChain as any);

    const invoices = await InvoiceService.list(
      userId,
      operator,
      maliciousStatus
    );

    // asegura que se filtró por userId
    expect(mockedDb().where).toHaveBeenCalledWith({ userId });
    // asegura que NO se usó andWhereRaw (evita concatenación directa)
    expect(mockedDb().andWhereRaw).not.toHaveBeenCalled();
    // asegura que se usó andWhere con parámetros (parametrización de knex)
    expect(mockedDb().andWhere).toHaveBeenCalledWith(
      "status",
      operator,
      maliciousStatus
    );
    expect(mockedDb().select).toHaveBeenCalled();
    expect(invoices).toEqual(mockInvoices);
  });

  it("rechaza operadores inválidos (protección contra operadores tipo OR)", async () => {
    const userId = "user123";
    const invalidOperator = "OR";
    const status = "paid";

    // simula la llamada a la base de datos que nunca deberia suceder porque 
    // el operador OR no esta permitido por lo tanto se lanza el error. 
    const selectChain = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue([]),
    };

    //Cada vez que InvoiceService.list llame a db(), en vez de usar la DB real, va a recibir este objeto simulado (selectChain).
    // se pone por la dudas aunque nunca deberia llegar a llamarse a base de datos. 
    mockedDb.mockReturnValue(selectChain as any);

    // debe lanzar error
    await expect(
      InvoiceService.list(userId, invalidOperator, status)
    ).rejects.toThrow("Invalid operator");

    // confirmar que no llegó a ejecutar select cuando el operador es inválido
    expect(mockedDb().select).not.toHaveBeenCalled();
  });

});

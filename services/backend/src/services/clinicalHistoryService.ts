// src/services/clinicalHistoryService.ts
import db from '../db';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const unlink = promisify(fs.unlink);

interface CHRow {
  id: string;
  user_id: string;
  doctor_name: string;
  diagnose: string;
  created_at: Date;
  updated_at: Date;
}

interface FileRow {
  id: string;
  history_id: string;
  filename: string;
  path: string;
  original_name: string;
  mime_type: string;
  size: number;
}

class ClinicalHistoryService {
  static async list(
    userId: string,
    filters: { from?: Date; to?: Date }
  ) {
    let q = db<CHRow>('clinical_histories').where({ user_id: userId });
    if (filters.from) q = q.andWhere('created_at', '>=', filters.from);
    if (filters.to)   q = q.andWhere('created_at', '<=', filters.to);

    const histories = await q.select();
    const ids       = histories.map(h => h.id);
    const files     = ids.length
      ? await db<FileRow>('clinical_history_files')
          .whereIn('history_id', ids)
      : [];

    return histories.map(h => ({
      id:         h.id,
      doctorName: h.doctor_name,
      diagnose:   h.diagnose,
      createdAt:  h.created_at,
      updatedAt:  h.updated_at,
      files: files
        .filter(f => f.history_id === h.id)
        .map(f => ({
          id:           f.id,
          filename:     f.filename,
          path:         f.path,
          originalName: f.original_name,
          mimeType:     f.mime_type,
          size:         f.size,
        }))
    }));
  }

  static async getById(id: string, userId: string) {
    const h = await db<CHRow>('clinical_histories')
      .where({ id, user_id: userId })
      .first();
    if (!h) throw new Error('Not found');

    const files = await db<FileRow>('clinical_history_files')
      .where({ history_id: id });
    return {
      id:         h.id,
      doctorName: h.doctor_name,
      diagnose:   h.diagnose,
      createdAt:  h.created_at,
      updatedAt:  h.updated_at,
      files: files.map(f => ({
        id:           f.id,
        filename:     f.filename,
        path:         f.path,
        originalName: f.original_name,
        mimeType:     f.mime_type,
        size:         f.size,
      }))
    };
  }

  static async create(
    userId: string,
    data: any // { doctorName: string; diagnose: string; files: Express.Multer.File[] }
  ) {
    const [h] = await db<CHRow>('clinical_histories')
      .insert({
        user_id:     userId,
        doctor_name: undefined, // data.doctorName,
        diagnose:    undefined //data.diagnose
      })
      .returning(['id', 'doctor_name', 'diagnose', 'created_at', 'updated_at']);

    const fileRows = undefined; 
    /* data.files.map(f => ({
      history_id:    h.id,
      filename:      f.filename,
      path:          f.path,
      original_name: f.originalname,
      mime_type:     f.mimetype,
      size:          f.size
    }));
    */
    await db('clinical_history_files').insert(fileRows);

    return { 
      id:         h.id,
      doctorName: h.doctor_name,
      diagnose:   h.diagnose,
      createdAt:  h.created_at,
      updatedAt:  h.updated_at,
      files: fileRows
    };
  }

  static async deleteFile(userId: string, historyId: string, filename: string) {
    const h = await db('clinical_histories')
      .where({ id: historyId, user_id: userId })
      .first();
    if (!h) throw new Error('Not found');

    const f = await db<FileRow>('clinical_history_files')
      .where({ history_id: historyId, filename })
      .first();
    if (!f) throw new Error('File not found');

    try { await unlink(path.resolve(f.path)); } catch {}
    await db('clinical_history_files').where({ id: f.id }).delete();
  }
}

export default ClinicalHistoryService;

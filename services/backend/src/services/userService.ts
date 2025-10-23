// src/services/userService.ts
import db from '../db';

interface UserRow {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  picture_path: string | null;
}

class UserService {
  static async getById(userId: string) {
    const row = await db<UserRow>('users')
      .select(
        'id',
        'username',
        'email',
        'first_name',
        'last_name',
        'picture_path'
      )
      .where({ id: userId })
      .first();
    if (!row) throw new Error('User not found');

    return {
      id:         row.id,
      username:   row.username,
      email:      row.email,
      firstName:  row.first_name,
      lastName:   row.last_name,
      picturePath: row.picture_path
    };
  }

  static async updateProfile(
    userId: string,
    data: { firstName?: string; lastName?: string }
  ) {
    const upd: any = {};
    if (data.firstName !== undefined) upd.first_name = data.firstName;
    if (data.lastName  !== undefined) upd.last_name  = data.lastName;

    const [row] = await db<UserRow>('users')
      .update(upd)
      .where({ id: userId })
      .returning([
        'id',
        'username',
        'email',
        'first_name',
        'last_name',
        'picture_path'
      ]);
    if (!row) throw new Error('User not found');

    return {
      id:         row.id,
      username:   row.username,
      email:      row.email,
      firstName:  row.first_name,
      lastName:   row.last_name,
      picturePath: row.picture_path
    };
  }
}

export default UserService;

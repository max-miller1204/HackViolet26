import snowflake from 'snowflake-sdk';

// Configure Snowflake SDK to keep alive
snowflake.configure({ keepAlive: true });

let connection: snowflake.Connection | null = null;

const createConnection = (): snowflake.Connection => {
  return snowflake.createConnection({
    account: process.env.SNOWFLAKE_ACCOUNT || '',
    username: process.env.SNOWFLAKE_USER || '',
    password: process.env.SNOWFLAKE_PASSWORD || '',
    database: process.env.SNOWFLAKE_DATABASE || 'SAFENIGHT_DB',
    schema: process.env.SNOWFLAKE_SCHEMA || 'APP_DATA',
    warehouse: process.env.SNOWFLAKE_WAREHOUSE || 'COMPUTE_WH',
    role: process.env.SNOWFLAKE_ROLE || 'ACCOUNTADMIN',
    authenticator: process.env.SNOWFLAKE_AUTHENTICATOR || undefined,
  });
};

export const connect = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!process.env.SNOWFLAKE_ACCOUNT) {
      console.log('Snowflake credentials not configured, running in demo mode');
      resolve();
      return;
    }

    connection = createConnection();
    connection.connect((err) => {
      if (err) {
        console.error('Failed to connect to Snowflake:', err.message);
        reject(err);
      } else {
        console.log('Successfully connected to Snowflake (Real Database Mode)');
        resolve();
      }
    });
  });
};

export const isConnected = (): boolean => {
  return connection !== null && connection.isUp();
};

export const executeQuery = <T>(sql: string, binds: any[] = []): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    if (!connection || !connection.isUp()) {
      reject(new Error('Not connected to Snowflake'));
      return;
    }

    connection.execute({
      sqlText: sql,
      binds,
      complete: (err, stmt, rows) => {
        if (err) {
          console.error('Query execution error:', err.message);
          reject(err);
        } else {
          resolve((rows || []) as T[]);
        }
      },
    });
  });
};

// User operations
export interface SnowflakeUser {
  ID: string;
  EMAIL: string;
  PASSWORD_HASH: string;
  DISPLAY_NAME: string;
  WEIGHT: number | null;
  GENDER: string | null;
  SOS_CODE_WORD: string | null;
  SETTINGS: any;
  CREATED_AT: Date;
}

export const getUserByEmail = async (email: string): Promise<SnowflakeUser | null> => {
  const rows = await executeQuery<SnowflakeUser>(
    'SELECT * FROM USERS WHERE EMAIL = ?',
    [email]
  );
  return rows[0] || null;
};

export const getUserById = async (userId: string): Promise<SnowflakeUser | null> => {
  const rows = await executeQuery<SnowflakeUser>(
    'SELECT * FROM USERS WHERE ID = ?',
    [userId]
  );
  return rows[0] || null;
};

export const createUser = async (
  id: string,
  email: string,
  passwordHash: string,
  displayName: string
): Promise<void> => {
  const defaultSettings = JSON.stringify({
    shareLocation: true,
    allowCheckIns: true,
    autoEscalate: false,
    darkMode: true,
  });

  await executeQuery(
    `INSERT INTO USERS (ID, EMAIL, PASSWORD_HASH, DISPLAY_NAME, SETTINGS)
     VALUES (?, ?, ?, ?, PARSE_JSON(?))`,
    [id, email, passwordHash, displayName, defaultSettings]
  );
};

export const updateUser = async (
  userId: string,
  updates: Partial<{
    displayName: string;
    weight: number;
    gender: string;
    sosCodeWord: string;
    settings: any;
  }>
): Promise<void> => {
  const setClauses: string[] = [];
  const binds: any[] = [];

  if (updates.displayName !== undefined) {
    setClauses.push('DISPLAY_NAME = ?');
    binds.push(updates.displayName);
  }
  if (updates.weight !== undefined) {
    setClauses.push('WEIGHT = ?');
    binds.push(updates.weight);
  }
  if (updates.gender !== undefined) {
    setClauses.push('GENDER = ?');
    binds.push(updates.gender);
  }
  if (updates.sosCodeWord !== undefined) {
    setClauses.push('SOS_CODE_WORD = ?');
    binds.push(updates.sosCodeWord);
  }
  if (updates.settings !== undefined) {
    setClauses.push('SETTINGS = PARSE_JSON(?)');
    binds.push(JSON.stringify(updates.settings));
  }

  if (setClauses.length === 0) return;

  binds.push(userId);
  await executeQuery(
    `UPDATE USERS SET ${setClauses.join(', ')} WHERE ID = ?`,
    binds
  );
};

// Emergency contact operations
export interface SnowflakeEmergencyContact {
  ID: string;
  USER_ID: string;
  NAME: string;
  PHONE: string;
  RELATIONSHIP: string | null;
}

export const getEmergencyContacts = async (userId: string): Promise<SnowflakeEmergencyContact[]> => {
  return executeQuery<SnowflakeEmergencyContact>(
    'SELECT * FROM EMERGENCY_CONTACTS WHERE USER_ID = ?',
    [userId]
  );
};

export const addEmergencyContact = async (
  id: string,
  userId: string,
  name: string,
  phone: string,
  relationship?: string
): Promise<void> => {
  await executeQuery(
    `INSERT INTO EMERGENCY_CONTACTS (ID, USER_ID, NAME, PHONE, RELATIONSHIP)
     VALUES (?, ?, ?, ?, ?)`,
    [id, userId, name, phone, relationship || null]
  );
};

export const deleteEmergencyContact = async (contactId: string, userId: string): Promise<void> => {
  await executeQuery(
    'DELETE FROM EMERGENCY_CONTACTS WHERE ID = ? AND USER_ID = ?',
    [contactId, userId]
  );
};

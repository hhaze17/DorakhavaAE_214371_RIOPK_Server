import dotenv from 'dotenv';
import './index'; // Просто импортируем index.ts для выполнения его кода

dotenv.config();

// index.ts автоматически подключится к MongoDB и запустит сервер
// дополнительная логика не требуется

process.on('unhandledRejection', (err: Error) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  process.exit(1);
}); 
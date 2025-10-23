// db.js - helper para abrir a DB SQLite usando sqlite + sqlite3
import sqlite3 from "sqlite3";
import { open } from "sqlite";

export async function openDb(filename = "./database.sqlite") {
  // open cria (se não existir) e abre a conexão
  return open({
    filename,
    driver: sqlite3.Database,
  });
}
